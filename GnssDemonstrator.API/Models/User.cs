using System;
using System.Collections.Generic;

namespace GnssDemonstrator.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }

        // basic info
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }

        // result info
        public List<Result> Results { get; set; }
        public List<Test> Tests { get; set; }

        // my info
        public string Description { get; set; }
        public Photo Photo { get; set; }
    }
}