/**
 * @ClassName
 * @Description TODO
 * @Author bestsort
 * @Date 19-8-22 下午7:55
 * @Version 1.0
 */

package cn.bestsort.community.dto;

import lombok.Data;


@Data
public class AccessTokenDTO {
    private String client_id;
    private String client_secret;
    private String code;
    private String redirect_uri;
    private String state;

}
