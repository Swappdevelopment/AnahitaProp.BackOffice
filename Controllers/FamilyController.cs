using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AnahitaProp.BackOffice
{
    public class FamilyController : BaseController
    {
        public FamilyController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }

        [HttpPost]
        public IActionResult Save([FromBody]JObject param = null)
        {
            ProductFamily prodFamily = null;

            var toSave = new List<IdentityModel>();

            try
            {
                prodFamily = Helper.JSonCamelDeserializeObject<ProductFamily>(param);

                if (prodFamily != null)
                {
                    switch (prodFamily.RecordState)
                    {
                        case RecordState.Added:

                            if (prodFamily.Type_Id > 0 && prodFamily.Names?.Count > 0)
                            {
                                prodFamily.Slug = string.IsNullOrEmpty(prodFamily.Slug) ? prodFamily.Names[0].Value.ToSlug() : prodFamily.Slug;

                                toSave.Add(prodFamily);
                                toSave.AddRange(prodFamily.Names.Select(nm =>
                                {
                                    nm.AddCommand("ProductFamily_Id", $"SELECT ID FROM ProductFamilys WHERE Slug = '{prodFamily.Slug}' ");

                                    if (nm.Language_Id <= 0 && !string.IsNullOrEmpty(nm.Language?.Code))
                                    {
                                        nm.AddCommand("Language_Id", $"SELECT ID FROM Languages WHERE Code = '{nm.Language.Code}' ");
                                    }

                                    return nm.SetRecordState(RecordState.Added);
                                }));
                            }
                            break;

                        case RecordState.Updated:

                            if (prodFamily.ID > 0 && prodFamily.Type_Id > 0)
                            {
                                prodFamily.Slug = string.IsNullOrEmpty(prodFamily.Slug) ? prodFamily.Names[0].Value.ToSlug() : prodFamily.Slug;

                                toSave.Add(prodFamily);
                            }
                            break;

                        case RecordState.Deleted:

                            if (prodFamily.ID > 0)
                            {
                                toSave.AddRange(prodFamily.Names.Select(l => l.SetRecordState(RecordState.Deleted)));
                                toSave.Add(prodFamily);

                                prodFamily = null;
                            }
                            break;
                    }

                    if (prodFamily.Names?.Count > 0)
                    {
                        toSave.AddRange(prodFamily.Names.Where(l => l.RecordState == RecordState.Updated));
                    }

                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());

                        if (prodFamily != null && prodFamily.RecordState != RecordState.Deleted)
                        {
                            prodFamily = _dbi.GetProductFamilys(slug: prodFamily.Slug, withNames: true, withTypes: true).FirstOrDefault();
                        }
                    }
                    else
                    {
                        prodFamily = null;
                    }
                }

                return Json(prodFamily == null ? new { ok = false } : prodFamily.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                prodFamily = null;
            }
        }
    }
}
