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
    public class ProjectController : BaseController
    {
        public ProjectController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        [MenuRequirement("projects>crud")]
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

        [HttpPost]
        [Access]
        [MenuRequirement("projects>crud")]
        public IActionResult Save([FromBody]JObject param = null)
        {
            Project project = null;

            var toSave = new List<IdentityModel>();

            try
            {
                project = Helper.JSonCamelDeserializeObject<Project>(param);

                if (project != null)
                {
                    switch (project.RecordState)
                    {
                        case RecordState.Added:

                            if (project.Names?.Count > 0)
                            {
                                project.UID = Helper.GenerateSequentialGuid().ToString();
                                project.Slug = string.IsNullOrEmpty(project.Slug) ? project.Names[0].Value.ToSlug() : project.Slug;

                                project.StartDate = DateTimeOffset.UtcNow;

                                toSave.Add(project);
                                toSave.AddRange(project.Names.Select(nm =>
                                {
                                    nm.AddCommand("Project_Id", $"SELECT ID FROM Projects WHERE UID = '{project.UID}' ");

                                    if (nm.Language_Id <= 0 && !string.IsNullOrEmpty(nm.Language?.Code))
                                    {
                                        nm.AddCommand("Language_Id", $"SELECT ID FROM Languages WHERE Code = '{nm.Language.Code}' ");
                                    }

                                    return nm.SetRecordState(RecordState.Added);
                                }));
                            }
                            break;

                        case RecordState.Updated:

                            if (project.ID > 0)
                            {
                                project.UID = string.IsNullOrEmpty(project.UID) ? Helper.GenerateSequentialGuid().ToString() : project.UID;
                                project.Slug = string.IsNullOrEmpty(project.Slug) ? project.Names[0].Value.ToSlug() : project.Slug;

                                toSave.Add(project);
                            }
                            break;

                        case RecordState.Deleted:

                            if (project.ID > 0)
                            {
                                toSave.AddRange(project.Names.Select(l => l.SetRecordState(RecordState.Deleted)));
                                toSave.Add(project);

                                project = null;
                            }
                            break;
                    }

                    if (project.Names?.Count > 0)
                    {
                        toSave.AddRange(project.Names.Where(l => l.RecordState == RecordState.Updated));
                    }

                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());

                        if (project != null && project.RecordState != RecordState.Deleted)
                        {
                            project = _dbi.GetProjects(slug: project.Slug, withNames: true).FirstOrDefault();
                        }
                    }
                    else
                    {
                        project = null;
                    }
                }

                return Json(project == null ? new { ok = false } : project.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                project = null;
            }
        }
    }
}
