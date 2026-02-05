package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.service.FileUploadService;
import org.example.elearning.utils.CloudinaryUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    private final CloudinaryUtil cloudinaryUtil;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        log.info("Uploading file via CloudinaryUtil: {}", file.getOriginalFilename());
        String url = cloudinaryUtil.uploadImage(file);
        log.info("File uploaded successfully. URL: {}", url);
        return url;
    }
}
