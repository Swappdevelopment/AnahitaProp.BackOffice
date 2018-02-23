using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using AnahitaProp.Data;
using AnahitaProp.Data.Models;

namespace AnahitaProp.BackOffice
{
    public class ProductsController : BaseController
    {
        public ProductsController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult Get(long productID = 0, int offset = 0, int limit = 0)
        {
            Product[] products = null;


            try
            {
                products = _dbi.GetProducts(withNames: true, offset: 0, limit: limit);

                return Json(products == null ? new object[0] : products.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                products = null;
            }
        }
    }
}
