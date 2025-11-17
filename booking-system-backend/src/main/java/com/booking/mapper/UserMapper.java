package com.booking.mapper;

import com.booking.entity.User;
import java.util.List;

/**
 * 用户Mapper接口
 */
public interface UserMapper {
    int insert(User user);
    int update(User user);
    User findById(Integer userId);
    User findByUsername(String username);
    List<User> findAll();
}
