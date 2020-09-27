using System;
using System.Collections.Generic;

namespace GnssDemonstrator.API.Models
{
    public class Test
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public List<Question> Questions { get; set; }

        public User User { get; set; }
        public int UserId { get; set; }
    }
}