using Microsoft.AspNetCore.Authorization;

namespace AnahitaProp.BackOffice
{
    public class AccessRequirement : IAuthorizationRequirement
    {
        public AccessRequirement(bool allowInvalidPasswordFormat = false)
        {
            this.AllowInvalidPasswordFormat = allowInvalidPasswordFormat;
        }


        public bool AllowInvalidPasswordFormat { get; set; }
    }
}
