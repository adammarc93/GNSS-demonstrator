using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using AutoMapper;

using GnssDemonstrator.API.Data;
using GnssDemonstrator.API.Dtos;
using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/tests")]
    [ApiController]
    public class TestsController : ControllerBase
    {
        private IUserRepository _repository;
        private IMapper _mapper;

        public TestsController(IUserRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetTests(int userId)
        {
            var tests = await _repository.GetUserTests(userId);
            var testsToReturn = _mapper.Map<IEnumerable<TestForUpdateDto>>(tests);

            return Ok(testsToReturn);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTest(int userId, int id)
        {
            var test = await _repository.GetUserTest(userId);
            var testToReturn = _mapper.Map<TestForUpdateDto>(test);

            return Ok(testToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> AddTest(int userId, TestForUpdateDto testForUpdateDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var user = await _repository.GetUser(userId);
            var test = _mapper.Map<TestForUpdateDto, Test>(testForUpdateDto);

            user.Tests.Add(test);

            if (await _repository.SaveAll())
            {
                return Ok(testForUpdateDto);
            }

            return BadRequest("Nie można dodać testu");
        }
    }
}