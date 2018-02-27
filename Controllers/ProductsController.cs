using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Swapp.Data;
using Newtonsoft.Json.Linq;

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
        public IActionResult Get(long productID = 0, short? statusFilter = null, int offset = 0, int limit = 0)
        {
            Product[] products = null;

            try
            {
                products = _dbi.GetListProducts(withNames: true, statusFilter: statusFilter, offset: offset, limit: limit);

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


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult ChangeBoolean([FromBody]JObject param)
        {
            Product product = null;

            try
            {
                long id = param.JGetPropVal<long>("id");
                string action = param.JGetPropVal<string>("action");
                short? status = param.JGetPropVal<short?>("status");
                bool? hideSearch = param.JGetPropVal<bool?>("hideSearch");

                if (id > 0 && !string.IsNullOrEmpty(action))
                {
                    product = _dbi.GetProduct(id: id);

                    if (product != null)
                    {
                        product.RegisterForRecordStateChange();

                        switch (action.ToLower())
                        {
                            case "status":

                                if (status != null)
                                {
                                    product.Status = (ModelStatus)status.Value;
                                }

                                break;

                            case "hidesearch":

                                if (hideSearch != null)
                                {
                                    product.HideSearch = hideSearch.Value;
                                }

                                break;
                        }

                        product.RegisterForRecordStateChange();

                        product = _dbi.ManageModel(product);
                    }
                }

                return Json(product == null ? new { notFound = true } : product.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                product = null;
            }
        }
    }
}
