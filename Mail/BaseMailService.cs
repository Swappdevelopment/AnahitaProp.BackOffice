using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System;
using System.Threading.Tasks;

namespace AnahitaProp.BackOffice
{
    public class BaseMailService : IMailService
    {


        protected string _serverName;
        protected string _fromEmail;
        protected string _userName;
        protected string _password;

        protected string _host;
        protected int _port;
        protected bool _useSSL;


        public BaseMailService()
        {
            _serverName = null;
            _fromEmail = null;
            _userName = null;
            _password = null;

            _host = null;

            _useSSL = false;
        }

        protected void ValidateValues()
        {
            _userName = string.IsNullOrEmpty(_userName) ? _fromEmail : _userName;

            //_port = _port > 0 ? _port : DEFAULT_PORT;
        }


        private const string OFFICE_365_SMTP = "smtp.office365.com";

        public virtual async Task SendEmailAsync(
            string subject,
            string message,
            bool isMessageHtml = false,
            string toEmail = null,
            string fromEmail = null,
            string fromName = null,
            string replyToEmail = null,
            string replyToName = null,
            int port = 0)
        {
            try
            {
                fromEmail = string.IsNullOrEmpty(fromEmail) ? _fromEmail : fromEmail;
                replyToEmail = string.IsNullOrEmpty(replyToEmail) ? null : replyToEmail;


                var mmMsg = new MimeMessage();

                if (!string.IsNullOrEmpty(fromEmail))
                {
                    mmMsg.From.Add(new MailboxAddress(fromName, fromEmail));
                }

                if (!string.IsNullOrEmpty(replyToEmail))
                {
                    mmMsg.ReplyTo.Add(new MailboxAddress(replyToName, replyToEmail));
                }


                mmMsg.To.Add(new MailboxAddress(toEmail));
                mmMsg.Subject = subject;

                if (isMessageHtml)
                {
                    mmMsg.Body = new BodyBuilder()
                    {
                        HtmlBody = message
                    }.ToMessageBody();
                }
                else
                {
                    mmMsg.Body = new TextPart("plain")
                    {
                        Text = message
                    };
                }

                using (var client = new SmtpClient())
                {
                    if (_serverName.ToLower() == OFFICE_365_SMTP && _useSSL)
                    {
                        client.ServerCertificateValidationCallback = (s, c, h, e) =>
                        {
                            return (s != null && s.ToString() == OFFICE_365_SMTP);
                        };

                        await client.ConnectAsync(_serverName, _port, SecureSocketOptions.StartTls);
                    }
                    else
                    {
                        client.ServerCertificateValidationCallback = (s, c, h, e) =>
                        {
                            return (s != null && s.ToString() == _serverName);
                        };

                        await client.ConnectAsync(_serverName, _port, SecureSocketOptions.SslOnConnect);
                    }

                    await client.AuthenticateAsync(_userName, _password);

                    await client.SendAsync(mmMsg);
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public virtual void Dispose()
        {
            _serverName = null;
            _fromEmail = null;
            _userName = null;
            _password = null;
            _host = null;
            _port = 0;
        }
    }
}
