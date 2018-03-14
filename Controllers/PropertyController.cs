using AnahitaProp.Data;
using Microsoft.Extensions.Configuration;

namespace AnahitaProp.BackOffice
{
    public class PropertyController : BaseController
    {
        public PropertyController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }
    }
}
