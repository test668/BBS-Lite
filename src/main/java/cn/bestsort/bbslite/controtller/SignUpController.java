package cn.bestsort.bbslite.controtller;

import cn.bestsort.bbslite.dto.*;
import cn.bestsort.bbslite.enums.CustomizeErrorCodeEnum;
import cn.bestsort.bbslite.exception.CustomizeException;
import cn.bestsort.bbslite.mapper.UserMapper;
import cn.bestsort.bbslite.model.User;
import cn.bestsort.bbslite.model.UserExample;
import cn.bestsort.bbslite.service.MurmursHash;
import jdk.nashorn.internal.parser.Token;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * @ClassName SignUpController
 * @Description TODO 用户注册 密码为 murmur(用户密码+账号)
 * @Author bestsort
 * @Date 19-9-23 下午8:13
 * @Version 1.0
 */

@Controller
public class SignUpController {
    @Autowired
    UserMapper userMapper;

    @RequestMapping("/sign-up")
    public String signUp(){
        return "sign-up";
    }

    @ResponseBody
    @RequestMapping(value = "/sign-up",method = RequestMethod.POST)
    public Object post(@RequestBody UserCreateDTO userCreateDTO,
                       HttpServletResponse response,
                       HttpServletRequest request) {
        UserExample userExample = new UserExample();
        userExample.createCriteria()
                .andAccountIdEqualTo(userCreateDTO.getAccountId());

        if (! userMapper.selectByExample(userExample).isEmpty()){
            throw new CustomizeException(CustomizeErrorCodeEnum.USER_EXITED);
        }
        User user = new User();
        String token = UUID.randomUUID().toString();
        BeanUtils.copyProperties(userCreateDTO,user);
        user.setGmtModified(System.currentTimeMillis());
        user.setGmtCreate(user.getGmtModified());
        user.setPassword(MurmursHash.hashUnsigned(user.getPassword()+user.getAccountId()));
        user.setToken(token);

        request.getSession().setAttribute("user",user);
        response.addCookie(new Cookie("token",token));
        userMapper.insertSelective(user);
        return ResultDTO.okOf();
    }
}