package org.example.elearning.config;

import lombok.Getter;
import org.example.elearning.util.VNPayUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${payment.vnPay.url}")
    private String vnp_PayUrl;
    @Value("${payment.vnPay.return-url}")
    private String vnp_ReturnUrl;
    @Value("${payment.vnPay.tmn-code}")
    private String vnp_TmnCode;
    @Value("${payment.vnPay.secret-key}")
    private String secretKey;
    @Value("${payment.vnPay.version}")
    private String vnp_Version;
    @Value("${payment.vnPay.command}")
    private String vnp_Command;
    @Value("${payment.vnPay.order-type}")
    private String orderType;

    public Map<String, String> getVNPayConfig(){
        Map<String, String> vnParamsMap = new HashMap<>();
        vnParamsMap.put("vnp_Version", vnp_Version);
        vnParamsMap.put("vnp_Command",vnp_Command);
        vnParamsMap.put("vnp_TmnCode",vnp_TmnCode);
        vnParamsMap.put("vnp_CurrCode","VND");
        vnParamsMap.put("vnp_TxnRef", VNPayUtil.getRandomNumber(8));
        vnParamsMap.put("vnp_OrderInfo","Thanh toan don hang:"+VNPayUtil.getRandomNumber(8));
        vnParamsMap.put("vnp_OrderType",orderType);
        vnParamsMap.put("vnp_Locale","vn");
        vnParamsMap.put("vnp_ReturnUrl",vnp_ReturnUrl);

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = sdf.format(calendar.getTime());
        vnParamsMap.put("vnp_CreateDate",vnpCreateDate);
        calendar.add(Calendar.MINUTE,15);
        String vnp_ExpireDate = sdf.format(calendar.getTime());
        vnParamsMap.put("vnp_ExpireDate",vnp_ExpireDate);
        return vnParamsMap;

    }
}
