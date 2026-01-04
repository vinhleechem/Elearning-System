package org.example.elearning.mapper;

import org.example.elearning.dto.response.CommissionRateResponse;
import org.example.elearning.dto.response.InstructorPayoutResponse;
import org.example.elearning.entity.CommissionRateEntity;
import org.example.elearning.entity.InstructorPayoutEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommissionMapper {
    
    @Mapping(source = "id", target = "id")
    @Mapping(source = "instructor.instructorId", target = "instructorId")
    @Mapping(source = "instructor.user.fullName", target = "instructorName")
    @Mapping(source = "rate", target = "rate")
    @Mapping(source = "effectiveDate", target = "effectiveDate")
    CommissionRateResponse toCommissionRateResponse(CommissionRateEntity entity);
    
    @Mapping(source = "payoutId", target = "payoutId")
    @Mapping(source = "instructor.instructorId", target = "instructorId")
    @Mapping(source = "instructor.user.fullName", target = "instructorName")
    @Mapping(source = "order.orderId", target = "orderId")
    @Mapping(source = "orderAmount", target = "orderAmount")
    @Mapping(source = "commissionRate", target = "commissionRate")
    @Mapping(source = "commissionAmount", target = "commissionAmount")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "createdAt", target = "createdAt")
    InstructorPayoutResponse toPayoutResponse(InstructorPayoutEntity entity);
}
