using System;

namespace GnssDemonstrator.API.Models
{
    public class Result
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public double Value { get; set; }

        public User User { get; set; }
        public int UserId { get; set; }
    }
}