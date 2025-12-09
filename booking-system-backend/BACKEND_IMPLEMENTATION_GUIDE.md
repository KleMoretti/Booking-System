# 后端代码实现完整指南

## 当前进度

### ✅ 已完成
1. **数据库设计** - schema.sql 完整（包含payments和operation_logs表）
2. **实体类** - 所有Entity类完整
3. **通用类** - Result, ResultCode, PageResult
4. **工具类** - JwtUtil, PasswordUtil, RedisUtil
5. **DTO类** - LoginDTO, RegisterDTO, OrderDTO, PaymentDTO, TicketQueryDTO
6. **VO类** - UserVO（已完成，其他需补充）

### 📋 待实现代码模板

## 1. 完整的UserService实现示例

```java
package com.booking.service.impl;

import com.booking.common.Result;
import com.booking.common.ResultCode;
import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.User;
import com.booking.mapper.UserMapper;
import com.booking.service.IUserService;
import com.booking.utils.JwtUtil;
import com.booking.utils.PasswordUtil;
import com.booking.vo.UserVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements IUserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Result<UserVO> login(LoginDTO loginDTO) {
        // 1. 根据用户名查询用户
        User user = userMapper.selectByUsername(loginDTO.getUsername());
        
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND);
        }
        
        // 2. 验证密码
        if (!PasswordUtil.matches(loginDTO.getPassword(), user.getPassword())) {
            return Result.error(ResultCode.PASSWORD_ERROR);
        }
        
        // 3. 检查是否被删除
        if (user.getIsDeleted() == 1) {
            return Result.error(ResultCode.USER_NOT_FOUND);
        }
        
        // 4. 生成Token
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername());
        
        // 5. 组装返回数据
        UserVO userVO = new UserVO();
        BeanUtils.copyProperties(user, userVO);
        userVO.setToken(token);
        
        return Result.success(userVO);
    }

    @Override
    public Result<Void> register(RegisterDTO registerDTO) {
        // 1. 检查用户名是否已存在
        User existUser = userMapper.selectByUsername(registerDTO.getUsername());
        if (existUser != null) {
            return Result.error(ResultCode.USER_ALREADY_EXISTS);
        }
        
        // 2. 检查邮箱是否已存在
        if (registerDTO.getEmail() != null) {
            User emailUser = userMapper.selectByEmail(registerDTO.getEmail());
            if (emailUser != null) {
                return Result.error("邮箱已被注册");
            }
        }
        
        // 3. 检查手机号是否已存在
        if (registerDTO.getPhone() != null) {
            User phoneUser = userMapper.selectByPhone(registerDTO.getPhone());
            if (phoneUser != null) {
                return Result.error("手机号已被注册");
            }
        }
        
        // 4. 创建新用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(PasswordUtil.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setUserType((byte) 0);
        user.setBalance(BigDecimal.ZERO);
        
        userMapper.insert(user);
        
        return Result.success();
    }

    @Override
    public Result<UserVO> getUserProfile(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND);
        }
        
        UserVO userVO = new UserVO();
        BeanUtils.copyProperties(user, userVO);
        
        return Result.success(userVO);
    }

    @Override
    public Result<Void> updateProfile(Integer userId, User updateUser) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND);
        }
        
        // 更新允许修改的字段
        if (updateUser.getEmail() != null) {
            user.setEmail(updateUser.getEmail());
        }
        if (updateUser.getPhone() != null) {
            user.setPhone(updateUser.getPhone());
        }
        
        userMapper.updateById(user);
        return Result.success();
    }

    @Override
    public Result<Void> changePassword(Integer userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error(ResultCode.USER_NOT_FOUND);
        }
        
        if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
            return Result.error(ResultCode.PASSWORD_ERROR);
        }
        
        user.setPassword(PasswordUtil.encode(newPassword));
        userMapper.updateById(user);
        
        return Result.success();
    }
}
```

## 2. IUserService接口

```java
package com.booking.service;

import com.booking.common.Result;
import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.User;
import com.booking.vo.UserVO;

public interface IUserService {
    Result<UserVO> login(LoginDTO loginDTO);
    Result<Void> register(RegisterDTO registerDTO);
    Result<UserVO> getUserProfile(Integer userId);
    Result<Void> updateProfile(Integer userId, User updateUser);
    Result<Void> changePassword(Integer userId, String oldPassword, String newPassword);
}
```

## 3. UserController实现

```java
package com.booking.controller;

import com.booking.common.Result;
import com.booking.dto.LoginDTO;
import com.booking.dto.RegisterDTO;
import com.booking.entity.User;
import com.booking.service.IUserService;
import com.booking.utils.JwtUtil;
import com.booking.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private IUserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public Result<UserVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }
    
    @PostMapping("/register")
    public Result<Void> register(@Validated @RequestBody RegisterDTO registerDTO) {
        return userService.register(registerDTO);
    }
    
    @GetMapping("/profile")
    public Result<UserVO> getUserProfile(HttpServletRequest request) {
        Integer userId = getCurrentUserId(request);
        return userService.getUserProfile(userId);
    }
    
    @PutMapping("/profile")
    public Result<Void> updateProfile(HttpServletRequest request, @RequestBody User user) {
        Integer userId = getCurrentUserId(request);
        return userService.updateProfile(userId, user);
    }
    
    @PutMapping("/password")
    public Result<Void> changePassword(HttpServletRequest request, 
                                        @RequestParam String oldPassword,
                                        @RequestParam String newPassword) {
        Integer userId = getCurrentUserId(request);
        return userService.changePassword(userId, oldPassword, newPassword);
    }
    
    @PostMapping("/logout")
    public Result<Void> logout() {
        // 可以在这里清除Redis中的token
        return Result.success();
    }
    
    private Integer getCurrentUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtUtil.getUserIdFromToken(token);
    }
}
```

## 4. UserMapper接口

```java
package com.booking.mapper;

import com.booking.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User selectById(@Param("userId") Integer userId);
    User selectByUsername(@Param("username") String username);
    User selectByEmail(@Param("email") String email);
    User selectByPhone(@Param("phone") String phone);
    int insert(User user);
    int updateById(User user);
    int deleteById(@Param("userId") Integer userId);
}
```

## 5. UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.booking.mapper.UserMapper">
    
    <resultMap id="BaseResultMap" type="com.booking.entity.User">
        <id column="user_id" property="userId"/>
        <result column="username" property="username"/>
        <result column="password" property="password"/>
        <result column="email" property="email"/>
        <result column="phone" property="phone"/>
        <result column="user_type" property="userType"/>
        <result column="balance" property="balance"/>
        <result column="create_time" property="createTime"/>
        <result column="update_time" property="updateTime"/>
        <result column="is_deleted" property="isDeleted"/>
    </resultMap>
    
    <select id="selectById" resultMap="BaseResultMap">
        SELECT * FROM users WHERE user_id = #{userId} AND is_deleted = 0
    </select>
    
    <select id="selectByUsername" resultMap="BaseResultMap">
        SELECT * FROM users WHERE username = #{username} AND is_deleted = 0
    </select>
    
    <select id="selectByEmail" resultMap="BaseResultMap">
        SELECT * FROM users WHERE email = #{email} AND is_deleted = 0
    </select>
    
    <select id="selectByPhone" resultMap="BaseResultMap">
        SELECT * FROM users WHERE phone = #{phone} AND is_deleted = 0
    </select>
    
    <insert id="insert" useGeneratedKeys="true" keyProperty="userId">
        INSERT INTO users (username, password, email, phone, user_type, balance)
        VALUES (#{username}, #{password}, #{email}, #{phone}, #{userType}, #{balance})
    </insert>
    
    <update id="updateById">
        UPDATE users
        SET email = #{email},
            phone = #{phone},
            password = #{password},
            balance = #{balance},
            update_time = NOW()
        WHERE user_id = #{userId}
    </update>
    
    <update id="deleteById">
        UPDATE users SET is_deleted = 1 WHERE user_id = #{userId}
    </update>
    
</mapper>
```

## 6. 其他核心Service实现模板

### OrderService核心方法

```java
@Override
@Transactional
public Result<OrderVO> createOrder(Integer userId, OrderDTO orderDTO) {
    // 1. 验证班次是否存在
    Trip trip = tripMapper.selectById(orderDTO.getTripId());
    if (trip == null) {
        return Result.error(ResultCode.TRIP_NOT_FOUND);
    }
    
    // 2. 锁定座位（使用Redis分布式锁）
    List<Seat> seats = seatService.lockSeats(orderDTO.getSeatIds());
    if (seats.size() != orderDTO.getSeatIds().size()) {
        return Result.error(ResultCode.SEAT_NOT_AVAILABLE);
    }
    
    // 3. 计算订单金额
    BigDecimal totalAmount = trip.getBasePrice().multiply(
        new BigDecimal(orderDTO.getSeatIds().size())
    );
    
    // 4. 创建订单
    Order order = new Order();
    order.setOrderNumber(generateOrderNumber());
    order.setUserId(userId);
    order.setTotalAmount(totalAmount);
    order.setPaidAmount(BigDecimal.ZERO);
    order.setOrderStatus((byte) 0); // 待支付
    orderMapper.insert(order);
    
    // 5. 创建车票
    for (int i = 0; i < orderDTO.getSeatIds().size(); i++) {
        Ticket ticket = new Ticket();
        ticket.setOrderId(order.getOrderId());
        ticket.setTripId(orderDTO.getTripId());
        ticket.setSeatId(orderDTO.getSeatIds().get(i));
        ticket.setPassengerName(orderDTO.getPassengers().get(i).getPassengerName());
        ticket.setPassengerIdCard(orderDTO.getPassengers().get(i).getPassengerIdCard());
        ticket.setActualPrice(trip.getBasePrice());
        ticket.setTicketStatus((byte) 0);
        ticketMapper.insert(ticket);
    }
    
    // 6. 设置订单超时（15分钟）
    // 使用Redis或定时任务处理超时订单
    
    // 7. 返回订单信息
    OrderVO orderVO = new OrderVO();
    BeanUtils.copyProperties(order, orderVO);
    return Result.success(orderVO);
}
```

## 7. Security配置

```java
package com.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers("/user/login", "/user/register").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated();
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 8. 全局异常处理

```java
package com.booking.exception;

import com.booking.common.Result;
import com.booking.common.ResultCode;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return Result.error(ResultCode.PARAMS_ERROR.getCode(), "参数校验失败");
    }
    
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        e.printStackTrace();
        return Result.error(e.getMessage());
    }
}
```

## 实现清单

### 需要实现的文件（按优先级）

**优先级1 - 核心业务**
- [ ] IUserService + UserServiceImpl
- [ ] ITripService + TripServiceImpl
- [ ] IOrderService + OrderServiceImpl
- [ ] IPaymentService + PaymentServiceImpl
- [ ] UserController
- [ ] TripController
- [ ] OrderController
- [ ] PaymentController

**优先级2 - Mapper层**
- [ ] UserMapper + UserMapper.xml
- [ ] TripMapper + TripMapper.xml
- [ ] OrderMapper + OrderMapper.xml
- [ ] PaymentMapper + PaymentMapper.xml
- [ ] TicketMapper + TicketMapper.xml
- [ ] SeatMapper + SeatMapper.xml
- [ ] StationMapper + StationMapper.xml

**优先级3 - 配置和过滤器**
- [ ] SecurityConfig
- [ ] RedisConfig
- [ ] WebMvcConfig
- [ ] JwtAuthenticationFilter
- [ ] GlobalExceptionHandler

## 快速启动步骤

1. 确保MySQL数据库已启动，运行schema.sql创建表结构
2. 确保Redis已启动
3. 修改application.yml中的数据库连接信息
4. 按照上述模板实现所有Service和Controller
5. 运行BookingApplication启动项目
6. 访问 http://localhost:8080/api 测试接口

## API测试示例

```bash
# 用户注册
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com",
    "phone": "13800138000"
  }'

# 用户登录
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```
