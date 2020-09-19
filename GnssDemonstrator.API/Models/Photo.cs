using System;

namespace GnssDemonstrator.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public DateTime DateAdded { get; set; }
        public string public_id { get; set; } //cloudinary needed

        public User User { get; set; }
        public int UserId { get; set; }
    }
}