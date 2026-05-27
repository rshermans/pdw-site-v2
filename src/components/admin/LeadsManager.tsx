'use client';

import { Fragment, useEffect, useState } from 'react';

interface Lead {
  id: number;
  name: string;
  institution: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  function downloadCsv() {
    window.location.href = '/api/admin/leads?format=csv';
  }

  async function sendTestEmail() {
    setTestStatus('sending');
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-email' }),
      });
      setTestStatus(res.ok ? 'ok' : 'error');
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  }

  return (
    <div className="admin-card" style={{ marginTop: 24 }}>
      <div className="admin-card__head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Pedidos de contacto</h2>
          {!loading && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
              {total} {total === 1 ? 'registo' : 'registos'} no total
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="admin-btn admin-btn--ghost"
            onClick={sendTestEmail}
            disabled={testStatus === 'sending'}
            style={{ fontSize: 13 }}
          >
            {testStatus === 'idle' && 'Testar envio de email'}
            {testStatus === 'sending' && 'A enviar…'}
            {testStatus === 'ok' && '✓ Emails enviados'}
            {testStatus === 'error' && '✗ Erro no envio'}
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={downloadCsv}
            disabled={total === 0}
            style={{ fontSize: 13 }}
          >
            Baixar CSV
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>
          A carregar…
        </div>
      )}

      {!loading && leads.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>
          Ainda não há pedidos de contacto registados.
        </div>
      )}

      {!loading && leads.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)', textAlign: 'left' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Instituição</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Assunto</th>
                <th style={thStyle}>Data</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <Fragment key={lead.id}>
                  <tr
                    style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                  >
                    <td style={tdStyle}>{lead.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{lead.name}</td>
                    <td style={tdStyle}>{lead.institution}</td>
                    <td style={tdStyle}>
                      <a href={`mailto:${lead.email}`} style={{ color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                        {lead.email}
                      </a>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-muted)' }}>{lead.subject || '—'}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--color-muted)' }}>{formatDate(lead.created_at)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-muted)' }}>
                      {expanded === lead.id ? '▲' : '▼'}
                    </td>
                  </tr>
                  {expanded === lead.id && (
                    <tr key={`msg-${lead.id}`} style={{ background: 'var(--color-surface-alt, #f9fafb)' }}>
                      <td colSpan={7} style={{ padding: '12px 16px', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text)' }}>
                        <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Mensagem</strong>
                        {lead.message}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'middle',
};
