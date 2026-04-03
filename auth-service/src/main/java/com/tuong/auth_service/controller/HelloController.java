package com.tuong.auth_service.controller; // Dòng này cực kỳ quan trọng

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
  @GetMapping("/hello")
  String hello() {
    return "Hello World!";
  }
}
