package com.booking.mapper;

import com.booking.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 用户Mapper接口
 */
@Mapper
public interface UserMapper {
    int insert(User user);
    int updateById(User user);
    int updateProfile(@Param("userId") Integer userId, 
                     @Param("realName") String realName,
                     @Param("idCard") String idCard,
                     @Param("email") String email);
    User selectById(@Param("userId") Integer userId);
    User selectByUsername(@Param("username") String username);
    User selectByEmail(@Param("email") String email);
    User selectByPhone(@Param("phone") String phone);
    User selectByIdCard(@Param("idCard") String idCard);
    List<User> selectAll();
    Long countActiveUsers();
    int deleteById(@Param("userId") Integer userId);
    
    // 管理员用户管理相关方法
    List<User> searchUsers(@Param("keyword") String keyword, 
                          @Param("offset") Integer offset, 
                          @Param("pageSize") Integer pageSize);
    Long countSearchUsers(@Param("keyword") String keyword);
    List<User> getAllUsersWithPagination(@Param("offset") Integer offset, 
                                          @Param("pageSize") Integer pageSize);
    int updatePassword(@Param("userId") Integer userId, @Param("password") String password);
    int updateStatus(@Param("userId") Integer userId, @Param("status") Byte status);
    Long countUserOrders(@Param("userId") Integer userId);
}
