using Microsoft.AspNetCore.Authorization;

namespace AnahitaProp.BackOffice
{
    public class AccessAttribute : AuthorizeAttribute
    {
        public const string TOKEN_KEY = "TokenAuth";
        public const string TOKEN_ALLOW_INVLD_PASSWORD_KEY = "TokenAuthAllowInvalidPasswordFormat";


        public AccessAttribute(bool allowInvalidPassword = false, string menusRequired = null)
            : base(policy: allowInvalidPassword ? TOKEN_ALLOW_INVLD_PASSWORD_KEY : TOKEN_KEY)
        {
        }
    }
}
