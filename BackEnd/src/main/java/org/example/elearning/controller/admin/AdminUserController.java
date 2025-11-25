package org.example.elearning.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import static org.example.elearning.dto.response.StandardResponse.*;

import org.example.elearning.aspect.SecuredEndpoint;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {
    UserService userService;

    @Operation(summary = "Lấy danh sách users", description = "API dành cho admin để lấy toàn bộ danh sách user trong hệ thống")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("")
    @SecuredEndpoint("VIEW_USER")
    public ResponseEntity<StandardResponse<Object>> getUsers() {
        List<UserResponse> re = userService.getAllUsers();
        return ResponseEntity.ok(success("Lấy danh sách users thành công", re ));
    }

    @Operation(summary = "Tạo user mới", description = "API cho admin thêm user mới vào hệ thống")
    @ApiResponse(responseCode = "200", description = "Tạo user thành công")
    @PostMapping("")
    public ResponseEntity<StandardResponse<Object>> addUser(@RequestBody UserCreateRequest userRequest) {
        UserResponse re =  userService.createUser(userRequest);
        return ResponseEntity.ok(success("Tạo user thành công", re));
    }

    @Operation(summary = "Cập nhật thông tin user", description = "API cho admin chỉnh sửa thông tin của user theo ID")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse<Object>> updateUser(@PathVariable Long id,
                                                               @RequestBody UserUpdateRequest userRequest) {
        UserResponse re =  userService.updateUser(id,userRequest);
        return ResponseEntity.ok(success("Cập nhật user thành công", re));
    }

    @Operation(summary = "Xóa user", description = "API cho admin xóa user theo ID")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(success("Xóa user thành công"));
    }

    @Operation(summary = "Khôi phục user", description = "API cho admin khôi phục user đã bị xóa theo ID")
    @ApiResponse(responseCode = "200", description = "Khôi phục thành công")
    @PatchMapping("/{id}")
    public ResponseEntity<StandardResponse<String>> restoreUser(@PathVariable Long id) {
        userService.restoreUser(id);
        return ResponseEntity.ok(success("Khôi phục user thành công"));
    }
}
