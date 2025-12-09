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
    User selectById(@Param("userId") Integer userId);
    User selectByUsername(@Param("username") String username);
    User selectByEmail(@Param("email") String email);
    User selectByPhone(@Param("phone") String phone);
    List<User> selectAll();
    int deleteById(@Param("userId") Integer userId);
}
