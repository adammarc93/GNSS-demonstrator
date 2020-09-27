using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using GnssDemonstrator.API.Data;
using GnssDemonstrator.API.Dtos;
using GnssDemonstrator.API.Helpers;

namespace GnssDemonstrator.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private IUserRepository _repository;
        private IMapper _mapper;

        public UsersController(IUserRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _repository.GetUsers();
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);

            usersToReturn = usersToReturn.OrderByDescending(br => br.BestResult);

            SetUserPlace(usersToReturn);

            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            // to fix
            var users = await _repository.GetUsers();
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);

            usersToReturn = usersToReturn.OrderByDescending(br => br.BestResult);

            SetUserPlace(usersToReturn);

            var user = users.FirstOrDefault(u => u.Id == id);
            var userToReturn = _mapper.Map<UserForDetailedDto>(user);

            userToReturn.Place = usersToReturn.FirstOrDefault(u => u.Id == id).Place;

            return Ok(userToReturn);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var userFromRepo = await _repository.GetUser(id);

            _mapper.Map(userForUpdateDto, userFromRepo);

            if (await _repository.SaveAll())
            {
                return NoContent();
            }

            throw new Exception($"Aktualizacja użytkownika o id {id} nie powiodła się przy zapisie do bazy");
        }

        private void SetUserPlace(IEnumerable<UserForListDto> users)
        {
            for (int i = 0; i < users.Count(); i++)
            {
                users.ElementAt(i).Place = i + 1;
            }
        }
    }
}