using System;
using System.ComponentModel.DataAnnotations;

namespace GnssDemonstrator.API.Dtos
{
    public class UserForRegisterDto
    {
        [Required(ErrorMessage = "Nazwa użytkownika jest wymagana")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Hasło jest wymagane")]
        [StringLength(12, MinimumLength = 6, ErrorMessage = "Hasło musi się składać z 6 do 12 znaków")]
        public string Password { get; set; }

        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }

        public UserForRegisterDto()
        {
            Created = DateTime.Now;
            LastActive = DateTime.Now;
        }
    }
}