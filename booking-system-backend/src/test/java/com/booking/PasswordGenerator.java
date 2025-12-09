package com.booking;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码生成器 - 用于生成BCrypt密码hash
 */
public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=".repeat(80));
        System.out.println("BCrypt密码Hash生成器 - 用于生成测试数据");
        System.out.println("=".repeat(80));
        System.out.println();
        
        // 定义测试用户密码
        String[][] testPasswords = {
            {"admin123", "管理员账号"},
            {"user123", "普通用户账号"},
            {"test123", "测试用户账号"},
            {"password123", "通用测试密码"}
        };
        
        // 生成每个密码的hash
        for (String[] passwordInfo : testPasswords) {
            String password = passwordInfo[0];
            String description = passwordInfo[1];
            String hash = encoder.encode(password);
            
            System.out.println("密码: " + password + " (" + description + ")");
            System.out.println("Hash: " + hash);
            
            // 验证
            boolean matches = encoder.matches(password, hash);
            System.out.println("验证: " + (matches ? "✓ 通过" : "✗ 失败"));
            System.out.println("-".repeat(80));
        }
        
        System.out.println();
        System.out.println("提示：将上面生成的Hash值复制到 init_test_data.sql 中使用");
        System.out.println("注意：BCrypt每次生成的Hash都不同（因为内含随机盐），但都能验证成功");
    }
}
