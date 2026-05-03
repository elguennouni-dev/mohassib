package com.elguennouni.mohassib;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MohassibApplication {

	public static void main(String[] args) {
		SpringApplication.run(MohassibApplication.class, args);
	}

}
