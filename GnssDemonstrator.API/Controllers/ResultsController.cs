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
    [Route("api/users/{userId}/results")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private IUserRepository _repository;
        private IMapper _mapper;

        public ResultsController(IUserRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetResultsAsync(int userId)
        {
            var user = await _repository.GetUser(userId);
            var resultsToReturn = _mapper.Map<IEnumerable<ResultForDetailedDto>>(user.Results);

            return Ok(resultsToReturn);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResultAsync(int userId, int id)
        {
            var user = await _repository.GetUser(userId);
            var result = user.Results.FirstOrDefault(r => r.Id == id);
            var resultToReturn = _mapper.Map<ResultForDetailedDto>(result);

            return Ok(resultToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> AddResult(int userId, ResultForUpdateDto resultForUpdateDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var user = await _repository.GetUser(userId);
            var result = _mapper.Map<ResultForUpdateDto, Result>(resultForUpdateDto);

            user.Results.Add(result);

            if (await _repository.SaveAll())
            {
                return Ok(resultForUpdateDto);
            }

            return BadRequest("Nie można dodać wyniku");
        }
    }
}