import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data, fileContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_excel":
        systemPrompt = `Sei un assistente esperto in computi metrici e prezziari regionali italiani.
Analizza il contenuto del file Excel/CSV fornito e:
1. Identifica le colonne (codice, descrizione, unità di misura, quantità, prezzo)
2. Estrai le voci di computo
3. Raggruppa per categoria quando possibile
4. Identifica i codici prezzario regionali se presenti

Rispondi SOLO con un JSON valido nel formato:
{
  "voci": [
    {
      "codice": "string",
      "descrizione": "string",
      "unitaMisura": "string",
      "quantita": number,
      "prezzoUnitario": number,
      "categoria": "string"
    }
  ],
  "note": "string con eventuali osservazioni"
}`;
        userPrompt = `Analizza questo contenuto e estrai le voci di computo:\n\n${fileContent || data}`;
        break;

      case "find_code":
        systemPrompt = `Sei un esperto di prezziari regionali italiani (Lombardia, Lazio, Campania, Emilia Romagna, Veneto, Toscana, Piemonte, ecc.).
Data una descrizione di lavorazione, suggerisci il codice prezzario più appropriato.

Rispondi SOLO con un JSON valido:
{
  "suggestions": [
    {
      "codice": "string",
      "descrizione": "string",
      "regione": "string",
      "categoria": "string",
      "prezzoIndicativo": number
    }
  ]
}`;
        userPrompt = `Trova il codice prezzario per: ${data}`;
        break;

      case "group_items":
        systemPrompt = `Sei un esperto di computi metrici.
Raggruppa le voci fornite per categorie logiche (es: Opere edili, Impianti elettrici, Impianti meccanici, ecc.)

Rispondi SOLO con un JSON valido:
{
  "gruppi": [
    {
      "categoria": "string",
      "voci": ["id1", "id2"]
    }
  ]
}`;
        userPrompt = `Raggruppa queste voci:\n${JSON.stringify(data)}`;
        break;

      case "suggest_items":
        systemPrompt = `Sei un esperto di computi metrici per edilizia.
Basandoti sulle voci esistenti, suggerisci voci che potrebbero mancare per completare il computo.

Rispondi SOLO con un JSON valido:
{
  "suggerimenti": [
    {
      "descrizione": "string",
      "motivazione": "string",
      "categoria": "string",
      "unitaMisura": "string"
    }
  ]
}`;
        userPrompt = `Voci esistenti:\n${JSON.stringify(data)}\n\nSuggerisci voci mancanti.`;
        break;

      default:
        // Generic query
        systemPrompt = `Sei un assistente esperto in computi metrici, prezziari regionali e contabilità lavori.
Rispondi in modo conciso e pratico. Se possibile, fornisci codici prezzario specifici.`;
        userPrompt = data;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite richieste superato, riprova tra poco." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crediti AI esauriti." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Errore AI gateway" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Try to parse JSON response
    let parsedContent = content;
    try {
      // Extract JSON from response if wrapped in markdown
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch {
      // Keep as string if not valid JSON
    }

    return new Response(
      JSON.stringify({ success: true, result: parsedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Computo AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
