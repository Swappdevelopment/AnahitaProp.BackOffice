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
using System.Threading.Tasks;

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
        public async Task<IActionResult> Get(long productID = 0, short? statusFilter = null, int offset = 0, int limit = 0, bool withProperties = false)
        {
            Product[] products = null;
            Property[] properties = null;

            try
            {
                await Task.WhenAll(
                    Helper.GetFunc(() =>
                    {
                        products = _dbi.GetListProducts(withNames: true, withoutGroupsAndSubs: true, statusFilter: statusFilter, offset: offset, limit: limit);

                        return Task.CompletedTask;
                    })(),
                    Helper.GetFunc(() =>
                    {
                        properties = withProperties ? _dbi.GetPropertysDetails() : null;

                        return Task.CompletedTask;
                    })());


                return Json(new { products = products?.Select(l => l.Simplify()).ToArray(), properties = properties?.Select(l => l.Simplify()).ToArray() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                products = null;
                properties = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductPropertiesDetails()
        {
            Property[] result = null;

            try
            {
                result = _dbi.GetPropertysDetails();

                return Json(result == null ? new object[0] : result.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductProjectsDetails()
        {
            Project[] result = null;

            try
            {
                result = _dbi.GetProjects(withNames: true);

                return Json(result == null ? new object[0] : result.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductFlags(long productID = 0)
        {
            Product product = null;

            try
            {
                product = _dbi.GetProductsFlags(productID).FirstOrDefault();

                return Json(new
                {
                    productFlags = product?.Flags?.Select(l => l.Simplify()).ToArray(),
                    propertyFlags = product?.Property?.Flags?.Select(l => l.Simplify()).ToArray()
                });
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


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult SaveBasics([FromBody]JObject param)
        {
            Product product = null;

            bool saved = false, hasNewPropFlags = false;

            List<IdentityModel> toSave = null;

            ProductSoldDate[] psds = null;

            string getProdIdQuery = null;

            IEnumerable<PropertyFlag> propertyFlags = null;


            try
            {
                product = Helper.JSonCamelDeserializeObject<Product>(param);

                product.Group_Id = product.Group_Id == 0 ? null : product.Group_Id;
                product.Project_Id = product.Project_Id == 0 ? null : product.Project_Id;
                product.Property_Id = product.Property_Id == 0 ? null : product.Property_Id;

                getProdIdQuery = $"SELECT ID FROM Products WHERE UID = '{product.UID}'";

                if (product != null)
                {
                    toSave = new List<IdentityModel>();

                    switch (product.RecordState)
                    {
                        case RecordState.Added:

                            product.UID = Helper.GenerateSequentialGuid().ToString();
                            product.Slug = _dbi.GetProductSlug(product.Slug.ToSlug(length: Product.SLUG_LENGTH - 4));

                            toSave.Add(product);

                            if (product.Names != null)
                            {
                                toSave.AddRange(
                                        product.Names
                                        .Select(l => l.SetRecordState(RecordState.Added).AddCommand("Product_Id", getProdIdQuery)));
                            }

                            toSave.Add(new ProductSalePeriod()
                            {
                                RecordState = RecordState.Added,
                                DateFrom = DateTime.UtcNow,
                                DateTo = null,
                            }.AddCommand("Product_Id", getProdIdQuery));
                            break;

                        case RecordState.Updated:

                            toSave.Add(product);
                            break;
                        case RecordState.Deleted:
                            break;
                    }

                    if (product.Names != null)
                    {
                        toSave.AddRange(
                                product.Names
                                .Where(l => l.RecordState == RecordState.Deleted || l.RecordState == RecordState.Updated)
                                .Select(l =>
                                {
                                    l.Product_Id = product.ID;
                                    return l;
                                }));
                    }

                    if (product.Flags != null)
                    {
                        toSave.AddRange(from fl in product.Flags
                                        where fl.RecordState != 0
                                        select Helper.GetFunc<ProductFlag, ProductFlag>(pfl =>
                                        {
                                            if (product.RecordState == RecordState.Added)
                                            {
                                                pfl.AddCommand("Product_Id", $"SELECT ID FROM Products WHERE UID = '{product.UID}' ");
                                            }
                                            else
                                            {
                                                pfl.Product_Id = product.ID;
                                            }

                                            return pfl;
                                        })(fl));
                    }

                    if (product.Property != null)
                    {
                        if (product.Property.RecordState != RecordState.None)
                        {
                            toSave.Add(product.Property);
                        }

                        if (product.Property.Neighbourhood != null
                            && product.Property.Neighbourhood.RecordState != RecordState.None)
                        {
                            toSave.Add(product.Property.Neighbourhood);
                        }

                        if (product.Property.Names != null)
                        {
                            toSave.AddRange(product.Property.Names.Where(l => l.RecordState != RecordState.None));
                        }

                        if (product.Property.Flags != null)
                        {
                            toSave.AddRange(from fl in product.Property.Flags
                                            where fl.RecordState != 0
                                            select Helper.GetFunc<PropertyFlag, PropertyFlag>(pfl =>
                                            {
                                                if (product.Property.RecordState == RecordState.Added)
                                                {
                                                    pfl.AddCommand("Property_Id", $"SELECT ID FROM Propertys WHERE Code = '{product.Property.Code}' ");
                                                }
                                                else
                                                {
                                                    pfl.Property_Id = product.Property.ID;
                                                }

                                                switch (pfl.RecordState)
                                                {
                                                    case RecordState.Added:
                                                        hasNewPropFlags = true;
                                                        break;
                                                }

                                                return pfl;
                                            })(fl));
                        }
                    }


                    if (toSave.Count > 0)
                    {
                        foreach (var tempProd in toSave.OfType<Product>().ToArray())
                        {
                            psds = tempProd.ID > 0 ? _dbi.GetProductSoldDates(tempProd.ID) : null;

                            if (tempProd.Type == ProductType.Resale)
                            {
                                tempProd.Project_Id = null;

                                if (psds == null || psds.Length == 0)
                                {
                                    psds = new ProductSoldDate[]
                                    {
                                        new ProductSoldDate()
                                        {
                                            RecordState = RecordState.Added,
                                            DateSold = DateTime.UtcNow.AddDays(-7)
                                        }.AddCommand<ProductSoldDate>("Product_Id", getProdIdQuery)
                                    };
                                }
                            }
                            else if (psds != null)
                            {
                                switch (tempProd.Type)
                                {
                                    case ProductType.Project:
                                        tempProd.Property_Id = null;
                                        break;
                                }

                                foreach (var psd in psds)
                                {
                                    psd.RecordState = RecordState.Deleted;
                                }
                            }

                            if (psds != null)
                            {
                                toSave.AddRange(psds.Where(l => l.RecordState != RecordState.None));
                            }
                        }

                        _dbi.ManageIdentityModels(toSave.ToArray());

                        saved = true;
                    }


                    bool clearProduct = true;

                    if (saved)
                    {
                        if (product.RecordState == RecordState.Added)
                        {
                            product = _dbi.GetListProducts(uid: product.UID, withNames: true, withoutGroupsAndSubs: true)?.FirstOrDefault();

                            clearProduct = false;
                        }
                        else if (product.RecordState == RecordState.Deleted)
                        {
                            product = null;
                        }

                        if (hasNewPropFlags && product.Property_Id > 0)
                        {
                            propertyFlags = _dbi.GetProductsFlags(product.ID, includeProductFlags: false).FirstOrDefault()?.Property?.Flags;
                        }
                    }

                    product = clearProduct ? null : product;
                }

                return Json(new { saved, newProduct = product?.Simplify(), propertyFlags = propertyFlags?.Select(l => l.Simplify()).ToArray() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                toSave?.Clear();
                toSave = null;
                product = null;
                propertyFlags = null;
            }
        }
    }
}
