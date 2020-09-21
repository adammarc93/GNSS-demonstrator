using System.Security.Claims;
using System.Threading.Tasks;

using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

using GnssDemonstrator.API.Data;
using GnssDemonstrator.API.Dtos;
using GnssDemonstrator.API.Helpers;
using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photo")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private IUserRepository _repository;
        private IMapper _mapper;
        private IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public PhotosController(IUserRepository repository, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repository = repository;

            Account account = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.AdpSecret
            );

            _cloudinary = new Cloudinary(account);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm] PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var userFromRepo = await _repository.GetUser(userId);
            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult();

            if (file.Length == 0)
            {
                return BadRequest("Nie można dodać zdjęcia");
            }

            if (userFromRepo.Photo != null)
            {
                var deletionParams = new DeletionParams(userFromRepo.Photo.public_id);
                var deletionResult = _cloudinary.Destroy(deletionParams).Result;
            }

            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.Name, stream),
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                };

                uploadResult = _cloudinary.Upload(uploadParams);
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            var photo = _mapper.Map<Photo>(photoForCreationDto);

            userFromRepo.Photo = photo;

            if (await _repository.SaveAll())
            {
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);

                // to fix
                // return CreatedAtRoute("GetPhoto", new { id = photo.Id}, photoToReturn);
                return Ok();
            }

            return BadRequest("Nie można dodać zdjęcia");
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await _repository.GetPhoto(id);
            var photoForReturn = _mapper.Map<PhotoForReturnDto>(photoFromRepo);

            return Ok(photoForReturn);
        }

        // [HttpDelete("{id}")]
        [HttpDelete]

        public async Task<IActionResult> DeletePhoto(int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var userFromRepo = await _repository.GetUser(userId);

            // if (userFromRepo.Photo == null)
            // {
            //     return Unauthorized();
            // }

            // var photoFromRepo = await _repository.GetPhoto(id);

            if (userFromRepo.Photo.public_id != null)
            {
                var deletionParams = new DeletionParams(userFromRepo.Photo.public_id);
                var deletionResult = _cloudinary.Destroy(deletionParams);

                if (deletionResult.Result == "ok")
                {
                    _repository.Delete(userFromRepo.Photo);
                }
            }
            else
            {
                _repository.Delete(userFromRepo.Photo);
            }

            if (await _repository.SaveAll())
            {
                return Ok();
            }

            return BadRequest("Nie udało się uzunąć zdjęcia");
        }
    }
}