"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import "./LeadForm.css";

const leadSchema = z.object({
  name:        z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  institution: z.string().min(2, "Instituição deve ter pelo menos 2 caracteres"),
  email:       z.string().email("Email inválido"),
  subject:     z.string().optional(),
  message:     z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormSectionProps {
  dict: any;
  initialEmail?: string;
  lang: string;
}

export function LeadFormSection({ dict, initialEmail, lang }: LeadFormSectionProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { email: initialEmail ?? "" },
  });

  const nameValue = watch("name");
  const institutionValue = watch("institution");

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setSubmitError(json.error ?? "Erro ao enviar. Tente novamente.");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setSubmitError("Sem ligação ao servidor. Tente novamente.");
    }
  };

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "11px 14px",
    marginTop: 6,
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-bg)",
    color: "var(--color-text)",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text)",
  };

  const errorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  };

  return (
    <section className="section-card" style={{ marginTop: 16 }}>
      <div className="lead-form-container">

        {/* ── Left: form ── */}
        <div className="form-content">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="success-message-inner"
            >
              <div style={{ marginBottom: 20, color: "var(--color-primary)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 style={{ marginTop: 0 }}>Obrigado, {nameValue || ""}!</h3>
              <p style={{ color: "var(--color-muted)", marginBottom: 24, lineHeight: 1.6 }}>
                O pedido para a <strong>{institutionValue || "sua instituição"}</strong> foi
                registado. A nossa equipa entrará em contacto brevemente.
              </p>
              <button className="cta btn-secondary" onClick={() => setIsSubmitted(false)}>
                Enviar outra mensagem
              </button>
            </motion.div>
          ) : (
            <>
              <p style={{ color: "var(--color-muted)", marginTop: 0, marginBottom: 28, fontSize: 15, lineHeight: 1.6 }}>
                {dict.contacts.invite}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <label style={labelStyle}>
                    {dict.contacts.form.name}
                    <input type="text" style={inputStyle} {...register("name")} placeholder="Seu nome completo" />
                    {errors.name && <span style={errorStyle}>{errors.name.message}</span>}
                  </label>
                  <label style={labelStyle}>
                    {dict.contacts.form.institution}
                    <input type="text" style={inputStyle} {...register("institution")} placeholder="Nome da organização" />
                    {errors.institution && <span style={errorStyle}>{errors.institution.message}</span>}
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <label style={labelStyle}>
                    {dict.contacts.form.email}
                    <input type="email" style={inputStyle} {...register("email")} placeholder="exemplo@instituicao.pt" />
                    {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
                  </label>
                  <label style={labelStyle}>
                    {dict.contacts.form.subject}
                    <input type="text" style={inputStyle} {...register("subject")} placeholder="Assunto (opcional)" />
                  </label>
                </div>

                <label style={labelStyle}>
                  {dict.contacts.form.message}
                  <textarea
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    {...register("message")}
                    placeholder="Como podemos colaborar?"
                  />
                  {errors.message && <span style={errorStyle}>{errors.message.message}</span>}
                </label>

                {submitError && (
                  <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{submitError}</p>
                )}

                <div>
                  <button
                    type="submit"
                    className="cta cta-disruptive"
                    disabled={isSubmitting}
                    style={{ padding: "14px 36px", cursor: isSubmitting ? "wait" : "pointer", border: "none", fontFamily: "inherit", fontSize: 15 }}
                  >
                    {isSubmitting ? "A enviar…" : dict.contacts.form.submit + " →"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ── Right: badge + contact info ── */}
        <div className="form-sidebar">

          {/* Trust indicator */}
          <div className="form-trust-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Parceiro da Agenda <strong>Blockchain.PT</strong> · PRR 2026</span>
          </div>

          {/* Badge preview */}
          <div className={`pdw-badge-preview ${isSubmitted ? "verified" : ""}`}>
            <div className="badge-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              PDW · Digital ID Pass
            </div>
            <div className="badge-divider" />
            <div className="badge-name">{nameValue || "Seu Nome"}</div>
            <div className="badge-institution">{institutionValue || "Instituição"}</div>
            <div className="badge-qr" aria-hidden="true">
              {[1,0,1,1,0,1,0,1,1,0,0,1,0,1,1,0].map((filled, i) => (
                <div key={i} className={`badge-qr-cell${filled ? " filled" : ""}`} />
              ))}
            </div>
            <div className="badge-status">
              {isSubmitted && (
                <svg style={{ marginRight: 5 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              {isSubmitted ? "Status: Verificado" : "Status: Aguardando submissão"}
            </div>
            <div className="badge-footer">
              Portuguese Digital Wallet Infrastructure · EBSI Approved
            </div>
            {isSubmitted && <div className="badge-verified-seal">OFFICIAL</div>}
          </div>

          <div style={{
            fontSize: '11px',
            color: 'var(--color-muted)',
            padding: '4px 10px',
            borderLeft: '2px solid var(--color-primary)',
            borderRadius: '0 4px 4px 0',
            background: 'rgba(0,108,75,0.05)',
            marginTop: '12px',
            marginBottom: '16px',
            display: 'block'
          }}>
            {lang === 'pt' ? '⚠ Demonstração ilustrativa do site — não representa um passe real' : '⚠ Website illustrative demo — does not represent an actual pass'}
          </div>

          {/* Contact info */}
          <div className="form-contact-info">
            <div className="form-contact-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{dict.footer.address}</span>
            </div>
            <div className="form-contact-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <a href={`mailto:${dict.footer.email}`}>{dict.footer.email}</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
