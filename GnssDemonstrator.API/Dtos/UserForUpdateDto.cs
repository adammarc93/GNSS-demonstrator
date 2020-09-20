using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Dtos
{
    public class UserForUpdateDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public string Description { get; set; }
    }
}