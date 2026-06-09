"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Locale } from "@/i18n/config";

const TIPOS_PARTICIPANTE = [
  "publico_geral", "universidade", "empresa", "admin_publica", "outro",
] as const;
const INTERESSES = [
  "tecnologia", "diplomas", "onboarding", "piloto", "parceria", "imprensa",
] as const;

const TIPOS_LABEL: Record<string, { pt: string; en: string }> = {
  publico_geral: { pt: "Público geral", en: "General public" },
  universidade:  { pt: "Universidade / Investigação", en: "University / Research" },
  empresa:       { pt: "Empresa", en: "Company" },
  admin_publica: { pt: "Administração pública", en: "Public administration" },
  outro:         { pt: "Outro", en: "Other" },
};

const INTERESSES_LABEL: Record<string, { pt: string; en: string }> = {
  tecnologia: { pt: "Tecnologia / infraestrutura", en: "Technology / infrastructure" },
  diplomas:   { pt: "Diplomas digitais", en: "Digital diplomas" },
  onboarding: { pt: "Onboarding digital", en: "Digital onboarding" },
  piloto:     { pt: "Projeto piloto", en: "Pilot project" },
  parceria:   { pt: "Parceria / colaboração", en: "Partnership / collaboration" },
  imprensa:   { pt: "Imprensa / comunicação", en: "Press / communication" },
};

const POLITICA_PRIVACIDADE_PT = `Nos termos dos artigos 13.º a 22.º do Regulamento (UE) 2016/679, a parceria é responsável pelo tratamento dos dados aqui recolhidos. Os seus dados serão usados estritamente para a gestão desta iniciativa (webinar) e reporte aos organismos financiadores, assistindo-lhe os direitos de acesso, retificação, apagamento, limitação do tratamento, portabilidade e oposição. Caso considere os seus direitos violados, poderá apresentar reclamação à CNPD. Para exercer os seus direitos, contacte o consórcio através do e-mail kto@tecminho.uminho.pt.`;
const POLITICA_PRIVACIDADE_EN = `Under Articles 13 to 22 of Regulation (EU) 2016/679, the partnership is responsible for processing the data collected here. Your data will be used strictly for the management of this initiative (webinar) and reporting to funding bodies, and you have the rights of access, rectification, erasure, restriction of processing, portability, and objection. If you consider your rights violated, you can file a complaint with CNPD. To exercise your rights, contact the consortium via email kto@tecminho.uminho.pt.`;

const WHATSAPP_URL = "https://chat.whatsapp.com/JyjCwcWsNNe5w4oP4QEvZW";

// Dynamic schema builder based on active language
const getInscricaoSchema = (isPt: boolean) => z.object({
  nome:                z.string().min(2, isPt ? "Nome deve ter pelo menos 2 caracteres" : "Name must be at least 2 characters"),
  email:               z.string().email(isPt ? "Email inválido" : "Invalid email"),
  organizacao:         z.string().optional(),
  telemovel:           z.string().optional(),
  tipo_participante:   z.enum(TIPOS_PARTICIPANTE, { message: isPt ? "Selecione o tipo de participante" : "Select participant type" }),
  interesse_principal: z.enum(INTERESSES).optional(),
  pergunta_speakers:   z.string().max(1000).optional(),
  whatsapp_consent:    z.boolean().optional(),
  consentimento:       z.boolean().refine((v) => v === true, {
                         message: isPt ? "É necessário aceitar a Política de Privacidade para continuar" : "You must accept the Privacy Policy to continue",
                       }),
  _hp:                 z.string().optional(),
});

type InscricaoValues = z.infer<ReturnType<typeof getInscricaoSchema>>;

interface Props {
  slug: string;
  inscricoesAbertas: boolean;
  capacidadeMaxima: number | null;
  totalInscritos?: number;
  lang: Locale;
}

export function WebinarInscricaoForm({ slug, inscricoesAbertas, capacidadeMaxima, totalInscritos = 0, lang }: Props) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPolitica, setShowPolitica] = useState(false);

  const isPt = lang === "pt";

  // Memoize Zod Schema based on locale
  const currentSchema = useMemo(() => getInscricaoSchema(isPt), [isPt]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InscricaoValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: { consentimento: false, whatsapp_consent: true },
  });

  const nomeValue = watch("nome");
  const cheio = capacidadeMaxima !== null && totalInscritos >= capacidadeMaxima;

  const onSubmit = async (data: InscricaoValues) => {
    setServerError(null);
    try {
      const res = await fetch(`/api/eventos/${slug}/inscricoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(json.error ?? (isPt ? "Erro ao processar inscrição. Tente novamente." : "Error processing registration. Please try again."));
        return;
      }
      setDone(true);
    } catch {
      setServerError(isPt ? "Sem ligação ao servidor. Tente novamente." : "No connection to the server. Please try again.");
    }
  };

  const inp: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "11px 14px",
    marginTop: 5,
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text)",
  };

  const errStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  };

  if (!inscricoesAbertas || cheio) {
    return (
      <div style={{
        background: "rgba(100,116,139,0.08)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "24px 28px",
        textAlign: "center",
        color: "var(--color-muted)",
        fontSize: 15,
      }}>
        {cheio 
          ? (isPt ? "Vagas esgotadas. As inscrições estão encerradas." : "Sold out. Registration is now closed.") 
          : (isPt ? "As inscrições para este evento estão encerradas." : "Registration for this event is closed.")}
      </div>
    );
  }

  if (done) {
    return (
      <div style={{
        background: "rgba(0, 108, 75, 0.04)",
        border: "1px solid rgba(0, 108, 75, 0.2)",
        borderRadius: 14,
        padding: "36px 32px",
        textAlign: "center",
      }}>
        <div style={{ color: "var(--color-primary)", marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3 style={{ margin: "0 0 12px", color: "var(--color-text)", fontSize: 20 }}>
          {isPt ? `Obrigado, ${nomeValue || ""}!` : `Thank you, ${nomeValue || ""}!`}
        </h3>
        <p style={{ margin: "0 0 8px", color: "var(--color-muted)", fontSize: 15, lineHeight: 1.6 }}>
          {isPt 
            ? "A sua inscrição foi registada. Receberá um email de confirmação em breve." 
            : "Your registration has been recorded. You will receive a confirmation email shortly."}
        </p>
        <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14, lineHeight: 1.6 }}>
          {isPt 
            ? "O link de acesso ao evento será enviado para o seu email nos dias anteriores ao evento." 
            : "The event access link will be sent to your email in the days leading up to the event."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "grid", gap: 18 }}>
      {/* honeypot */}
      <input type="text" {...register("_hp")} style={{ display: "none" }} tabIndex={-1} aria-hidden="true" suppressHydrationWarning />

      {/* Linha 1: nome + email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={lbl}>
          {isPt ? "Nome *" : "Name *"}
          <input type="text" {...register("nome")} style={inp} placeholder={isPt ? "Nome completo" : "Full name"} autoComplete="name" suppressHydrationWarning />
          {errors.nome && <span style={errStyle}>{errors.nome.message}</span>}
        </label>
        <label style={lbl}>
          {isPt ? "Email *" : "Email *"}
          <input type="email" {...register("email")} style={inp} placeholder="nome@instituicao.pt" autoComplete="email" suppressHydrationWarning />
          {errors.email && <span style={errStyle}>{errors.email.message}</span>}
        </label>
      </div>

      {/* Organização */}
      <label style={lbl}>
        {isPt ? "Organização" : "Organization"}
        <input type="text" {...register("organizacao")} style={inp} placeholder={isPt ? "Instituição ou empresa" : "Institution or company"} autoComplete="organization" suppressHydrationWarning />
      </label>

      {/* Telemóvel */}
      <label style={lbl}>
        {isPt ? "Telemóvel (opcional)" : "Mobile (optional)"}
        <input type="tel" {...register("telemovel")} style={inp} placeholder="+351 9XX XXX XXX" autoComplete="tel" suppressHydrationWarning />
      </label>

      {/* WhatsApp consent (pré-marcado) */}
      <div style={{
        background: "rgba(37,211,102,0.06)",
        border: "1px solid rgba(37,211,102,0.2)",
        borderRadius: 10,
        padding: "14px 16px",
      }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            {...register("whatsapp_consent")}
            style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, cursor: "pointer", accentColor: "#25D366" }}
          />
          <span style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.55 }}>
            {isPt ? (
              <>
                Quero juntar-me à{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600 }}>
                  comunidade WhatsApp do PDW
                </a>
                {" "}para receber o link de acesso e novidades sobre carteiras digitais.
              </>
            ) : (
              <>
                I want to join the{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600 }}>
                  PDW WhatsApp community
                </a>
                {" "}to receive the access link and updates about digital wallets.
              </>
            )}
          </span>
        </label>
      </div>

      {/* Linha 3: tipo de participante + interesse */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label style={lbl}>
          {isPt ? "Tipo de participante *" : "Participant type *"}
          <select {...register("tipo_participante")} style={{ ...inp, appearance: "none", cursor: "pointer" }} suppressHydrationWarning>
            <option value="">{isPt ? "Selecione…" : "Select..."}</option>
            {TIPOS_PARTICIPANTE.map((t) => (
              <option key={t} value={t}>{TIPOS_LABEL[t][lang]}</option>
            ))}
          </select>
          {errors.tipo_participante && <span style={errStyle}>{errors.tipo_participante.message}</span>}
        </label>
        <label style={lbl}>
          {isPt ? "Interesse principal" : "Primary interest"}
          <select {...register("interesse_principal")} style={{ ...inp, appearance: "none", cursor: "pointer" }} suppressHydrationWarning>
            <option value="">{isPt ? "Selecione (opcional)…" : "Select (optional)..."}</option>
            {INTERESSES.map((i) => (
              <option key={i} value={i}>{INTERESSES_LABEL[i][lang]}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Pergunta para speakers */}
      <label style={lbl}>
        {isPt ? "Tem alguma pergunta para os speakers? (opcional)" : "Do you have any questions for the speakers? (optional)"}
        <textarea
          {...register("pergunta_speakers")}
          rows={3}
          style={{ ...inp, resize: "vertical", marginTop: 5 }}
          placeholder={isPt 
            ? "Pode colocar a sua questão aqui. Iremos partilhá-la com os oradores antes do evento." 
            : "You can write your question here. We will share it with the speakers before the event."}
        />
      </label>

      {/* Política de Privacidade (RGPD) */}
      <div style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "16px 18px",
        background: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {isPt ? "Política de Privacidade" : "Privacy Policy"}
          </span>
          <button
            type="button"
            onClick={() => setShowPolitica((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              padding: "2px 6px",
            }}
            aria-expanded={showPolitica}
          >
            {showPolitica ? (isPt ? "Ocultar ▲" : "Hide ▲") : (isPt ? "Ler ▼" : "Read ▼")}
          </button>
        </div>

        {showPolitica && (
          <p style={{
            margin: "0 0 14px",
            fontSize: 12,
            color: "var(--color-text)",
            lineHeight: 1.65,
            border: "1px solid var(--color-border)",
            background: "color-mix(in srgb, var(--color-bg) 70%, transparent)",
            padding: "12px 14px",
            borderRadius: 6,
          }}>
            {isPt ? POLITICA_PRIVACIDADE_PT : POLITICA_PRIVACIDADE_EN}
          </p>
        )}

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            {...register("consentimento")}
            style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: "pointer", accentColor: "var(--color-primary)" }}
          />
          <span style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>
            {isPt 
              ? "Li e aceito a Política de Privacidade e autorizo o tratamento dos meus dados para as finalidades indicadas."
              : "I have read and accept the Privacy Policy and authorize the processing of my data for the indicated purposes."}
            {" "}<span style={{ color: "#ef4444" }}>*</span>
          </span>
        </label>
        {errors.consentimento && (
          <p style={{ ...errStyle, marginTop: 8, marginLeft: 26 }}>{errors.consentimento.message}</p>
        )}
      </div>

      {serverError && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{serverError}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cta cta-disruptive"
          style={{
            padding: "14px 36px",
            border: "none",
            fontFamily: "inherit",
            fontSize: 15,
            cursor: isSubmitting ? "wait" : "pointer",
          }}
        >
          {isSubmitting 
            ? (isPt ? "A registar…" : "Registering...") 
            : (isPt ? "Confirmar inscrição →" : "Confirm registration →")}
        </button>
      </div>
    </form>
  );
}
