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
}
