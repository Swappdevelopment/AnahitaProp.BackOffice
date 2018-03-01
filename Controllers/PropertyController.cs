using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Swapp.Data;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace AnahitaProp.BackOffice
{
    public class PropertyController : BaseController
    {
        public PropertyController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }
    }
}
