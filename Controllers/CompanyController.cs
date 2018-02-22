using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
{
    public class CompanyController : BaseController
    {
        public CompanyController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        [MenuRequirement("companies")]
        public IActionResult Get(string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            Company[] companies = null;

            object[] result = null;

            try
            {
                companies = _dbi.GetCompanies(
                                    nameFilter: nameFilter,
                                    includeBusinessType: true,
                                    statusFilter: statusFilter,
                                    limit: limit,
                                    offset: offset);

                if (companies == null)
                {
                    result = new object[0];
                }
                else
                {
                    result = companies.Select(c => new
                    {
                        c.Status,
                        c.ID,
                        c.UID,
                        c.TVA,
                        c.BRN,
                        Name = c.Name?.Trim()?.ToUpper(),
                        c.BusinessType_Id,
                        BusinessType = c.BusinessType?.Simplify()
                    }).ToArray();
                }

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("companies")]
        public IActionResult GetDetail([FromBody] dynamic param = null)
        {
            string uid = null;

            try
            {
                uid = param?.uid;

                return Json(this.GetCompanyDetail(uid, null));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                uid = null;
            }
        }

        private object GetCompanyDetail(string uid, short? status = 1)
        {
            Company company = null;

            object result = null;

            try
            {
                if (string.IsNullOrEmpty(uid)) throw new ExceptionID(MessageIdentifier.RECORD_NOT_FOUND);

                company = _dbi.GetCompanyDetail(uid, status: status);

                if (company == null) throw new ExceptionID(MessageIdentifier.RECORD_NOT_FOUND);

                result = company.Simplify();

                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                company = null;
                result = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("companies>crud")]
        public IActionResult Save([FromBody] dynamic param = null)
        {
            Company company = null;
            List<IdentityModel> toSave = null;

            object result = null;

            try
            {
                company = Helper.JSonCamelDeserializeObject<Company>(param);

                if (company == null) throw new NullReferenceException();


                toSave = new List<IdentityModel>();


                switch (company.RecordState)
                {
                    case RecordState.Added:

                        toSave.Add(company.NameToCapital());

                        company.UID = string.IsNullOrEmpty(company.UID) ? Helper.GenerateSequentialGuid().ToString() : company.UID;

                        if (company.TelNumbers != null)
                        {
                            foreach (var tn in company.TelNumbers)
                            {
                                tn.RecordState = RecordState.Added;
                                tn.AddCommand("Company_Id", $"SELECT ID FROM Companys WHERE UID = '{company.UID}' ");

                                toSave.Add(tn.SetNameToDefault());
                            }
                        }

                        if (company.Addresses != null)
                        {
                            foreach (var addr in company.Addresses)
                            {
                                addr.RecordState = RecordState.Added;

                                toSave.Add(addr);
                            }
                        }
                        break;

                    case RecordState.Updated:

                        toSave.Add(company.NameToCapital());

                        if (company.TelNumbers != null)
                        {
                            foreach (var tn in company.TelNumbers)
                            {
                                switch (tn.RecordState)
                                {
                                    case RecordState.Updated:
                                    case RecordState.Added:
                                        toSave.Add(tn.SetNameToDefault());
                                        break;
                                }
                            }
                        }

                        if (company.Addresses != null)
                        {
                            foreach (var addr in company.Addresses)
                            {
                                switch (addr.RecordState)
                                {
                                    case RecordState.Updated:
                                    case RecordState.Added:
                                        toSave.Add(addr);
                                        break;
                                }
                            }
                        }
                        break;

                    case RecordState.None:

                        if (company.TelNumbers != null)
                        {
                            toSave.AddRange(from t in company.TelNumbers
                                            where t.RecordState != RecordState.None && t.RecordState != RecordState.Deleted
                                            select t.SetNameToDefault());
                        }

                        if (company.Addresses != null)
                        {
                            toSave.AddRange(company.Addresses.Where(c => c.RecordState != RecordState.None && c.RecordState != RecordState.Deleted));
                        }
                        break;
                }

                company.Email = string.IsNullOrEmpty(company.Email) ? company.UID : company.Email;

                if (company.Addresses != null)
                {
                    foreach (var addr in company.Addresses)
                    {
                        switch (addr.RecordState)
                        {
                            case RecordState.Added:

                                if (addr.ID <= 0)
                                {
                                    addr.AddCommand("Company_Id", $"SELECT ID FROM Companys WHERE UID = '{company.UID}' ");
                                }

                                if (string.IsNullOrEmpty(addr.UID))
                                {
                                    addr.UID = Helper.GenerateSequentialGuid().ToString();
                                }
                                break;
                        }

                        addr.Company_Id = addr.Company_Id <= 0 ? null : addr.Company_Id;
                        addr.Venue_Id = addr.Venue_Id <= 0 ? null : addr.Venue_Id;
                    }
                }


                if (toSave.Count > 0)
                {
                    _dbi.ManageIdentityModels(toSave.ToArray());
                }

                if (company.TelNumbers != null)
                {
                    _dbi.DetatchTelNumbers(
                        (from tn in company.TelNumbers
                         where tn.RecordState == RecordState.Deleted
                         select tn).ToArray(),
                         DetatchFrom.Company);
                }

                if (company.Addresses != null)
                {
                    _dbi.DetatchAddresses(
                    (from tn in company.Addresses
                     where tn.RecordState == RecordState.Deleted
                     select tn).ToArray(),
                     DetatchFrom.Company);
                }

                if (company.RecordState == RecordState.Deleted)
                {
                    _dbi.DeleteCompanies(company);

                    result = new
                    {
                        deleted = true
                    };
                }
                else
                {
                    result = this.GetCompanyDetail(company.UID, null);
                }

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("companies>crud")]
        public IActionResult ChangeStatus([FromBody] dynamic param = null)
        {
            try
            {
                long id = param.id;

                ModelStatus status = (ModelStatus)((short)param.status);

                _dbi.ChangeModelStatus("Companys", id, status);

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult GetContacts(long companyID = 0, string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            CompanyContact[] contacts = null;

            object[] result = null;

            try
            {
                contacts = this.QueryCompanyContacts(companyID: companyID, nameFilter: nameFilter, statusFilter: statusFilter, limit: limit, offset: offset);

                result = contacts.Select(l => l.Simplify()).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                contacts = null;
                result = null;
            }
        }

        private CompanyContact[] QueryCompanyContacts(
            string uid = null,
            string email = null,
            string fName = null,
            string lName = null,
            string nameFilter = null,
            long companyID = 0,
            short? statusFilter = null,
            int limit = 0,
            int offset = 0)
        {
            CompanyContact[] contacts = null;

            try
            {
                contacts = _dbi.GetPersons(uid: uid, email: email, fName: fName, lName: lName, nameFilter: nameFilter, companyID: companyID, statusFilter: statusFilter, limit: limit, offset: offset)
                               .Where(l => l.CompanyContacts != null)
                               .SelectMany(l => l.CompanyContacts).ToArray();

                return contacts;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                contacts = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("companies>contacts>crud")]
        public IActionResult SaveContact([FromBody] JObject param = null)
        {
            CompanyContact companyContact = null;
            Person person = null;

            List<IdentityModel> toSave = null;

            try
            {
                companyContact = Helper.JSonCamelDeserializeObject<CompanyContact>(param);

                if (companyContact == null || companyContact.RecordState == RecordState.None)
                {
                    companyContact = null;
                }
                else
                {
                    if (companyContact.RecordState == RecordState.Deleted)
                    {
                        _dbi.ManageIdentityModels(companyContact);
                        companyContact = null;
                    }
                    else
                    {
                        companyContact.Occupation_Id = companyContact.Occupation_Id <= 0 ? null : companyContact.Occupation_Id;

                        person = Helper.JSonCamelDeserializeObject<Person>(param);

                        if (person == null) throw new NullReferenceException();


                        toSave = new List<IdentityModel>()
                        {
                            person,
                            companyContact
                        };


                        person.ID = companyContact.Contact_Id;

                        if (person.ID > 0)
                        {
                            person.RecordState = RecordState.Updated;

                            if (person.TelNumbers != null && person.TelNumbers.Count > 0)
                            {
                                foreach (var telNum in person.TelNumbers.Where(l => l.RecordState != RecordState.None))
                                {
                                    if (telNum.RecordState == RecordState.Deleted && telNum.ID > 0)
                                    {
                                        toSave.Add(telNum);
                                    }
                                    else
                                    {
                                        telNum.Company_Id = telNum.Company_Id <= 0 ? null : telNum.Company_Id;
                                        telNum.Person_Id = person.ID;
                                        telNum.Name = string.IsNullOrEmpty(telNum.Name) ? TelNumber.DEFAULT_NAME : telNum.Name;
                                        toSave.Add(telNum);
                                    }
                                }
                            }
                        }
                        else if (person.RecordState == RecordState.Added)
                        {
                            bool forceSave = param.JGetPropVal<bool>("forceSave");

                            if (!forceSave && _dbi.PersonNameUsed(person.LName, person.FName))
                                throw new ExceptionID(MessageIdentifier.MYSQL_DUPLICATE);


                            person.UID = Helper.GenerateSequentialGuid().ToString();
                            companyContact.AddCommand("Contact_Id", $"SELECT ID FROM Persons WHERE UID = '{person.UID}' ");

                            if (person.TelNumbers != null && person.TelNumbers.Count > 0)
                            {
                                foreach (var telNum in person.TelNumbers.Where(l => l.RecordState == RecordState.Added || l.RecordState == RecordState.Updated))
                                {
                                    telNum.RecordState = RecordState.Added;
                                    telNum.Company_Id = telNum.Company_Id <= 0 ? null : telNum.Company_Id;
                                    telNum.Person_Id = null;
                                    telNum.AddCommand("Person_Id", $"SELECT ID FROM Persons WHERE UID = '{person.UID}' ");
                                    telNum.Name = string.IsNullOrEmpty(telNum.Name) ? TelNumber.DEFAULT_NAME : telNum.Name;
                                    toSave.Add(telNum);
                                }
                            }
                        }

                        _dbi.ManageIdentityModels(toSave.ToArray());

                        companyContact = QueryCompanyContacts(uid: person.UID, companyID: companyContact.Company_Id, statusFilter: null).FirstOrDefault();
                    }
                }
                return Json(companyContact == null ? new { ok = true } : companyContact.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                companyContact = null;
                person = null;

                toSave?.Clear();
                toSave = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult GetCourses(long companyID = 0, string nameFilter = null, bool includeObjectivesLength = false, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            CourseDetail[] courses = null;

            object[] result = null;

            try
            {
                courses = _dbi.GetCourses(companyID: companyID, nameFilter: nameFilter, limit: limit, offset: offset, includeObjectivesLength: includeObjectivesLength);

                result = courses.Select(l => l.Simplify()).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                courses = null;
                result = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult GetParticipants(long companyID = 0, long courseDetailID = 0, bool withDetails = false, bool withOccupations = false, string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            Person[] participants = null;

            object[] result = null;


            try
            {
                participants = _dbi.GetUniqueParticipants(companyID: companyID, detailID: courseDetailID, nameFilter: nameFilter, statusFilter: statusFilter, limit: limit, offset: offset, withOccupations: withOccupations);

                result = participants.Select(l => l.Simplify(true)).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                participants = null;
                result = null;
            }
        }

        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult GetParticipantTrainings(long companyID = 0, long personID = 0, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            Person participant = null;

            object[] result = null;

            Dictionary<string, object> dico = null;

            try
            {
                if (personID > 0)
                {
                    participant = _dbi.GetUniqueParticipants(companyID: companyID, personID: personID, statusFilter: statusFilter, limit: limit, offset: offset, withDetails: true)?.FirstOrDefault();
                }

                dico = new Dictionary<string, object>();

                result = participant == null || participant.Participants == null ? new object[0] :
                            participant.Participants
                                            .Where(l => l != null && l.CourseDetail != null)
                                            .Select(l =>
                                            {
                                                string key = $"{l.Occupation_Id}-{l.CourseDetail.ID}";

                                                if (!dico.TryGetValue(key, out object temp))
                                                {
                                                    temp = l.CourseDetail.Simplify(false, false, false, l.Occupation);

                                                    dico.Add(key, temp);
                                                }

                                                return temp;
                                            }).Distinct().ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                participant = null;
                result = null;

                dico?.Clear();
                dico = null;
            }
        }

        [HttpGet]
        [Access]
        [MenuRequirement("companies>contacts")]
        public IActionResult CanParticipantBeContact(long personID = 0, long companyID = 0)
        {
            Person participant = null;
            CourseParticipant courseParticipant = null;

            bool ok = false;
            long occupationID = 0;
            string occupationName = null;

            try
            {
                if (!_dbi.GetCompanyContacts(personID: personID, companyID: companyID).Any())
                {
                    if (personID > 0)
                    {
                        participant = _dbi.GetUniqueParticipants(companyID: companyID, personID: personID, withDetails: true)?.FirstOrDefault();

                        if (participant != null)
                        {
                            ok = true;

                            if (participant.Participants != null)
                            {
                                courseParticipant = participant.Participants.FirstOrDefault();

                                occupationID = courseParticipant == null || courseParticipant.Occupation_Id == null ? 0 : courseParticipant.Occupation_Id.Value;
                                occupationName = courseParticipant?.Occupation?.Name;
                            }
                        }
                    }
                }


                return Json(new { ok = ok, occupationID = occupationID, occupationName = occupationName });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                participant = null;
                courseParticipant = null;
                occupationName = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("companies>contacts>crud")]
        public IActionResult SaveCompanyContactTypes([FromBody] JObject param = null)
        {
            CompanyContactType companyContactType = null;

            try
            {
                companyContactType = Helper.JSonCamelDeserializeObject<CompanyContactType>(param);

                if (companyContactType != null
                    && (companyContactType.RecordState == RecordState.Added || companyContactType.RecordState == RecordState.Deleted)
                    && companyContactType.Contact_Id > 0
                    && ((short)companyContactType.Value) > 0)
                {
                    companyContactType = _dbi.ManageModel(companyContactType);
                }

                return Json(new { returnValue = companyContactType?.Simplify() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                companyContactType = null;
            }
        }
    }
}
