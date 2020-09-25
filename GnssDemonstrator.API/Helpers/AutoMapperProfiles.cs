using System.Linq;

using AutoMapper;

using GnssDemonstrator.API.Dtos;
using GnssDemonstrator.API.Models;

namespace GnssDemonstrator.API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserForListDto>()
                .ForMember(dest => dest.PhotoUrl, opt =>
                {
                    opt.MapFrom(src => src.Photo.Url);
                })
                .ForMember(dest => dest.Age, opt =>
                {
                    opt.ResolveUsing(src => src.DateOfBirth.CalculateAge());
                })
                .ForMember(dest => dest.BestResult, opt =>
                {
                    opt.ResolveUsing(src => src.Results.Any() ? src.Results.Select(v => v.Value).Max() : (double?)null);
                })
                .ForMember(dest => dest.AverageResult, opt =>
                {
                    opt.ResolveUsing(src => src.Results.Any() ? src.Results.Select(v => v.Value).Average() : (double?)null);
                });

            CreateMap<User, UserForDetailedDto>()
                .ForMember(dest => dest.Age, opt =>
                {
                    opt.ResolveUsing(src => src.DateOfBirth.CalculateAge());
                })
                .ForMember(dest => dest.BestResult, opt =>
                {
                    opt.ResolveUsing(src => src.Results.Any() ? src.Results.Select(v => v.Value).Max() : (double?)null);
                })
                .ForMember(dest => dest.AverageResult, opt =>
                {
                    opt.ResolveUsing(src => src.Results.Any() ? src.Results.Select(v => v.Value).Average() : (double?)null);
                });

            CreateMap<Result, ResultForDetailedDto>();

            CreateMap<UserForUpdateDto, User>();

            CreateMap<PhotoForCreationDto, Photo>();

            CreateMap<Photo, PhotoForReturnDto>();

            CreateMap<UserForRegisterDto, User>();

            CreateMap<ResultForUpdateDto, Result>();
        }
    }
}