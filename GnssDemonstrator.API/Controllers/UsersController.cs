using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using GnssDemonstrator.API.Data;
using GnssDemonstrator.API.Dtos;

namespace GnssDemonstrator.API.Controllers
{
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

            return Ok(usersToReturn);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _repository.GetUser(id);
            var usersToReturn = _mapper.Map<UserForDetailedDto>(user);

            return Ok(usersToReturn);
        }
    }
}