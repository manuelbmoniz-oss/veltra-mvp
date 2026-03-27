import { Resend } from 'resend'

const FROM = 'Veltra Business Solutions <noreply@veltra.pt>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder')
}

export async function sendEmailConfirmacao(to: string, nome: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/verificar?token=${token}`

  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Confirme o seu email — Veltra Business Solutions',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #1F4E79; padding: 32px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
            Veltra Business Solutions
          </h1>
          <p style="color: #D6E4F0; margin: 8px 0 0; font-size: 14px;">Marketplace B2B de Serviços Empresariais</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1F4E79; font-size: 20px; margin: 0 0 16px;">Bem-vindo/a, ${nome}!</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
            Obrigado por se registar na Veltra Business Solutions. Para ativar a sua conta,
            clique no botão abaixo para confirmar o seu endereço de email.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}"
               style="background: #2E75B6; color: #ffffff; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;
                      font-size: 16px; display: inline-block;">
              Confirmar Email
            </a>
          </div>
          <p style="color: #6B7280; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
            Este link é válido por 24 horas. Se não criou uma conta na Veltra,
            pode ignorar este email.
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0;">
            Ou copie este link: <a href="${url}" style="color: #2E75B6;">${url}</a>
          </p>
        </div>
        <div style="background: #F3F4F6; padding: 24px 40px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Veltra Business Solutions. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendNotificacaoFatura(
  to: string,
  nomeDestinatario: string,
  numeroPedido: string,
  nomePrestador: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Fatura disponível para confirmação — Pedido #${numeroPedido}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1F4E79; padding: 32px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Veltra Business Solutions</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1F4E79; font-size: 18px; margin: 0 0 16px;">Nova Fatura para Confirmar</h2>
          <p style="color: #374151; line-height: 1.6;">
            Olá ${nomeDestinatario},<br><br>
            O prestador <strong>${nomePrestador}</strong> carregou uma fatura relativa ao
            pedido <strong>#${numeroPedido}</strong>.
          </p>
          <p style="color: #374151; line-height: 1.6; margin-top: 16px;">
            Aceda à sua conta para consultar e confirmar o documento.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/cliente"
               style="background: #2E75B6; color: #ffffff; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Ver Fatura
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendNotificacaoAdjudicacao(
  to: string,
  nomePrestador: string,
  tituloPedido: string,
  pedidoId: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `A sua proposta foi adjudicada — ${tituloPedido}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1F4E79; padding: 32px 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Veltra Business Solutions</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1F4E79; font-size: 18px; margin: 0 0 16px;">Parabéns! Proposta Adjudicada</h2>
          <p style="color: #374151; line-height: 1.6;">
            Olá ${nomePrestador},<br><br>
            A sua proposta para o pedido <strong>"${tituloPedido}"</strong> foi adjudicada!
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/partilhado/fatura/${pedidoId}"
               style="background: #2E75B6; color: #ffffff; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Gerir Serviço
            </a>
          </div>
        </div>
      </div>
    `,
  })
}
