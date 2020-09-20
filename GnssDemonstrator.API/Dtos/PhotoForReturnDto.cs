using System;

namespace GnssDemonstrator.API.Dtos
{
    public class PhotoForReturnDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public DateTime DateAdded { get; set; }
        public string public_id  { get; set; }
    }
}