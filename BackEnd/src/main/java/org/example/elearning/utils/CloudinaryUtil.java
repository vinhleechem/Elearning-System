package org.example.elearning.utils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Component
public class CloudinaryUtil {
    Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        String publicValue = generatePublicValue(file.getOriginalFilename());
        String extension = getFileName(file.getOriginalFilename())[1];
        File fileUpload = convert(file);
        cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
        cleanDisk(fileUpload);
        return cloudinary.url().generate(StringUtils.join(publicValue, ".", extension));
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        String publicValue = generatePublicValue(file.getOriginalFilename());
        String extension = getFileName(file.getOriginalFilename())[1];
        File fileUpload = convert(file);
        
        // Upload video với resource_type = "video"
        cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap(
            "public_id", publicValue,
            "resource_type", "video"
        ));
        
        cleanDisk(fileUpload);
        
        // Return video URL
        return cloudinary.url()
            .resourceType("video")
            .generate(StringUtils.join(publicValue, ".", extension));
    }

    public void deleteImageByUrl(String imageUrl) {
        if (StringUtils.isBlank(imageUrl)) {
            return;
        }
        try {
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (StringUtils.isNotBlank(publicId)) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            log.error("Không thể xoá ảnh trên Cloudinary, url: {}", imageUrl, e);
        }
    }

    public void deleteVideoByUrl(String videoUrl) {
        if (StringUtils.isBlank(videoUrl)) {
            return;
        }
        try {
            String publicId = extractPublicIdFromUrl(videoUrl);
            if (StringUtils.isNotBlank(publicId)) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
            }
        } catch (Exception e) {
            log.error("Không thể xoá video trên Cloudinary, url: {}", videoUrl, e);
        }
    }

    private File convert(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        File convFile = new File(StringUtils.join(generatePublicValue(file.getOriginalFilename()), getFileName(file.getOriginalFilename())[1]));
        try(InputStream is = file.getInputStream()) {
            Files.copy(is, convFile.toPath());
        }
        return convFile;
    }

    private void cleanDisk(File file) {
        try {
            Path filePath = file.toPath();
            Files.delete(filePath);
        } catch (IOException e) {
            log.error("Error");
        }
    }

    public String generatePublicValue(String originalName){
        String fileName = getFileName(originalName)[0];
        return StringUtils.join(UUID.randomUUID().toString(), "_", fileName);
    }

    public String[] getFileName(String originalName) {
        return originalName.split("\\.");
    }


    private String extractPublicIdFromUrl(String url) {
        if (StringUtils.isBlank(url)) {
            return null;
        }
        try {
            String path = url.split("/image/upload/")[1];
            String lastPart = path.substring(path.lastIndexOf('/') + 1);
            int dotIndex = lastPart.lastIndexOf('.');
            if (dotIndex > 0) {
                return lastPart.substring(0, dotIndex);
            }
            return lastPart;
        } catch (Exception e) {
            log.error("Không thể parse public_id từ url Cloudinary: {}", url, e);
            return null;
        }
    }
}
