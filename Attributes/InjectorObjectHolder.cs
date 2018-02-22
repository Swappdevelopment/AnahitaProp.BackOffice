using System;
using System.Collections.Generic;

namespace AnahitaProp.BackOffice
{
    public class InjectorObjectHolder : IInjectorObjectHolder
    {
        private Dictionary<string, object> _holder = new Dictionary<string, object>();

        public InjectorObjectHolder()
        {
        }


        public void AddObject(string key, object value)
        {
            if (_holder == null || string.IsNullOrEmpty(key)) return;


            _holder.Remove(key);

            if (value != null)
            {
                _holder.Add(key, value);
            }
        }

        public void RemoveObject(string key)
        {
            if (_holder == null || string.IsNullOrEmpty(key)) return;


            _holder.Remove(key);
        }

        public object GetObject(string key)
        {
            if (_holder != null
                && !string.IsNullOrEmpty(key)
                && _holder.TryGetValue(key, out object result)) return result;


            return null;
        }


        public void Dispose()
        {
            _holder?.Clear();
            _holder = null;
        }
    }

    public interface IInjectorObjectHolder : IDisposable
    {
        void AddObject(string key, object value);
        void RemoveObject(string key);
        object GetObject(string key);
    }
}
