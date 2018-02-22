using Microsoft.AspNetCore.Authentication.Cookies;
using System.Threading.Tasks;

namespace AnahitaProp.BackOffice
{
    public class CookieAuthenticationEvents : ICookieAuthenticationEvents
    {
        public Task RedirectToAccessDenied(CookieRedirectContext context)
        {
            context.Response.Headers["Location"] = context.RedirectUri;
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        }

        public Task RedirectToLogin(CookieRedirectContext context)
        {
            context.Response.Headers["Location"] = context.RedirectUri;
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        }

        public Task RedirectToLogout(CookieRedirectContext context)
        {
            return Task.CompletedTask;
        }

        public Task RedirectToReturnUrl(CookieRedirectContext context)
        {
            return Task.CompletedTask;
        }

        public Task SignedIn(CookieSignedInContext context)
        {
            return Task.CompletedTask;
        }

        public Task SigningIn(CookieSigningInContext context)
        {
            return Task.CompletedTask;
        }

        public Task SigningOut(CookieSigningOutContext context)
        {
            return Task.CompletedTask;
        }

        public Task ValidatePrincipal(CookieValidatePrincipalContext context)
        {
            return Task.CompletedTask;
        }
    }
}
