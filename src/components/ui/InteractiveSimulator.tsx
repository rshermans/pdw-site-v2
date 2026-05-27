'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulatorProps {
  dict: any;
  lang: string;
}

export function InteractiveSimulator({ dict, lang }: SimulatorProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Translations or fallbacks
  const t = {
    title: lang === 'pt' ? 'Simulador de Verificação' : 'Verification Simulator',
    subtitle: lang === 'pt' ? 'Arraste ou clique para verificar o diploma' : 'Drag or click to verify the diploma',
    verifyBtn: lang === 'pt' ? 'Verificar Credencial' : 'Verify Credential',
    verifying: lang === 'pt' ? 'A verificar blockchain...' : 'Verifying blockchain...',
    successTitle: lang === 'pt' ? 'Diploma Válido' : 'Valid Diploma',
    successText: lang === 'pt' ? 'A credencial foi verificada com sucesso na rede EBSI.' : 'The credential was successfully verified on the EBSI network.',
    resetBtn: lang === 'pt' ? 'Tentar Novamente' : 'Try Again',
    student: lang === 'pt' ? 'João Silva' : 'John Doe',
    degree: lang === 'pt' ? 'Mestrado em Engenharia' : 'Master in Engineering',
    issuer: 'Universidade do Minho'
  };

  const handleVerify = () => {
    setStep(1);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep(2);
    }, 2000);
  };

  const handleReset = () => {
    setStep(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleVerify();
    }
  };

  return (
    <div className="simulator-card">
      <div className="simulator-glow" />

      <div className="simulator-content">
        <h3 className="simulator-title">{t.title}</h3>
        <p className="simulator-subtitle">{t.subtitle}</p>

        <div style={{
          fontSize: '11px',
          color: 'var(--color-muted)',
          padding: '4px 10px',
          borderLeft: '2px solid var(--color-primary)',
          borderRadius: '0 4px 4px 0',
          background: 'rgba(0,108,75,0.05)',
          marginBottom: '16px',
          display: 'block'
        }}>
          {lang === 'pt' ? '⚠ Demonstração ilustrativa — não representa verificação real' : '⚠ Illustrative demo — does not represent actual verification'}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              className="simulator-dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={handleVerify}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-label={lang === 'pt' ? 'Simular verificação de diploma digital' : 'Simulate digital diploma verification'}
              whileHover={{ scale: 1.02 }}
            >
              <div className="simulator-icon-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div style={{ fontWeight: 600 }}>{t.degree}</div>
              <div style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{t.issuer}</div>
              <div className="cta" style={{ marginTop: '24px' }}>
                {t.verifyBtn}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              style={{ padding: '60px 0' }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid rgba(0,108,75,0.2)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ marginTop: '24px', fontWeight: 600, color: 'var(--color-primary)' }}>
                {t.verifying}
              </p>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="simulator-result-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="simulator-icon-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h4 style={{ color: '#059669', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>{t.successTitle}</h4>
              <p style={{ color: '#065F46', marginBottom: '24px' }}>{t.successText}</p>
              
              <div className="simulator-credential-preview">
                <div className="simulator-field-label">Titular</div>
                <div className="simulator-field-value">{t.student}</div>
                <div className="simulator-field-label">Emissor</div>
                <div className="simulator-field-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.issuer}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
              </div>

              <button onClick={handleReset} style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#059669',
                border: '1px solid #059669',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {t.resetBtn}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
