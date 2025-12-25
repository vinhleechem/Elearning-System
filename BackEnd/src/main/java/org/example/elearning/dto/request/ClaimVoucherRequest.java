package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClaimVoucherRequest {

    @NotBlank(message = "Voucher code is required")
    private String code;
}
