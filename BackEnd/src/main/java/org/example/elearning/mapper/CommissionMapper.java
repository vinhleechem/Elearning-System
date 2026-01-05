package org.example.elearning.mapper;

import org.example.elearning.dto.response.CommissionRateResponse;
import org.example.elearning.dto.response.InstructorPayoutResponse;
import org.example.elearning.entity.CommissionRateEntity;
import org.example.elearning.entity.InstructorPayoutEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommissionMapper {
    
    @Mapping(source = "instructor.instructorId", target = "instructorId")
    @Mapping(source = "instructor.user.fullName", target = "instructorName")
    CommissionRateResponse toCommissionRateResponse(CommissionRateEntity entity);
    
    @Mapping(source = "instructor.instructorId", target = "instructorId")
    @Mapping(source = "instructor.user.fullName", target = "instructorName")
    InstructorPayoutResponse toPayoutResponse(InstructorPayoutEntity entity);
}
