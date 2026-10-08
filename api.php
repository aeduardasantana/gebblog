<?php
/* Blog GEB — gateway exclusivamente de leitura (homologação).
 * Não concede acesso ao Google Drive nem fornece credenciais.
 * A implantação GAS precisa autorizar acesso anônimo à API pública.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
function reply(int $status, array $data): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
  exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') reply(405, ['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'METODO_INVALIDO']]);
$allowed = ['artigos', 'artigo', 'categorias', 'relacionados', 'destaques', 'status'];
$action = strtolower((string)($_GET['acao'] ?? 'artigos'));
if (!in_array($action, $allowed, true)) reply(400, ['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'ACAO_INVALIDA']]);
$query=['acao'=>$action];
foreach (['slug','categoria','tag','q','limite'] as $key) {
  if (!isset($_GET[$key])) continue;
  if (!is_string($_GET[$key])) reply(400, ['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'PARAMETRO_INVALIDO']]);
  $v=trim($_GET[$key]);
  if (strlen($v)>160 || preg_match('/[\x00-\x1F\x7F]/', $v)) reply(400, ['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'PARAMETRO_INVALIDO']]);
  if ($key==='slug' && $v!=='' && !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $v)) reply(400, ['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'SLUG_INVALIDO']]);
  if ($key==='limite') $v=(string)max(1,min(50,(int)$v));
  $query[$key]=$v;
}
if (in_array($action,['artigo','relacionados'],true) && empty($query['slug'])) reply(400,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'SLUG_NAO_INFORMADO']]);
if (!function_exists('curl_init')) reply(503,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'CURL_INDISPONIVEL']]);
$upstream='https://script.google.com/macros/s/AKfycbw8RHZZEVQtseHz-mqWKPvtqSYUM3iT9u_fz5v-p5gp6tvb0RjBhZhgfaAb3AlFZoRH/exec?'.http_build_query($query,'','&',PHP_QUERY_RFC3986);
$ch=curl_init($upstream);
curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>3,CURLOPT_CONNECTTIMEOUT=>8,CURLOPT_TIMEOUT=>28,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_USERAGENT=>'GEB-Blog-ReadGateway/1.0',CURLOPT_HTTPHEADER=>['Accept: application/json']]);
$raw=curl_exec($ch);
$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);
$error=curl_error($ch);
curl_close($ch);
if ($raw===false || $status!==200 || strlen($raw)>3000000) reply(502,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'API_INDISPONIVEL']]);
$parsed=json_decode($raw,true);
if (!is_array($parsed) || !isset($parsed['sucesso']) || !is_bool($parsed['sucesso'])) reply(502,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'RESPOSTA_API_INVALIDA']]);
if (!$parsed['sucesso']) {
  $code=(string)($parsed['erro']['codigo'] ?? 'ARTIGO_INDISPONIVEL');
  reply($code==='ARTIGO_NAO_DISPONIVEL'?404:400,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>$code]]);
}
$data=$parsed['dados'] ?? null;
$publicFields=['titulo','subtitulo','slug','resumo','categoria','categorias','tags','generoEditorial','autorPublico','dataPublicacao','dataPublicacaoISO','dataAtualizacao','dataAtualizacaoISO','imagemCapa','textoAlternativoImagem','tituloSEO','descricaoSEO','canonicalUrl','conteudoHTML','blocos','referenciasPublicas','correcaoPublica','atualizadoEm'];
$filterArticle=static function($article) use ($publicFields) {
  if (!is_array($article)) return [];
  return array_intersect_key($article,array_flip($publicFields));
};
if (in_array($action,['artigos','relacionados','destaques'],true)) {
  if (!is_array($data)) reply(502,['sucesso'=>false,'dados'=>null,'erro'=>['codigo'=>'DADOS_INVALIDOS']]);
  $data=array_map($filterArticle,$data);
} elseif ($action==='artigo') {
  $data=$filterArticle($data);
} elseif ($action==='categorias') {
  $data=is_array($data)?array_map(static function($c){return is_array($c)?array_intersect_key($c,array_flip(['nome','slug','quantidade'])):[];},$data):[];
} elseif ($action==='status') {
  $data=is_array($data)?array_intersect_key($data,array_flip(['sistema','versao','ambiente','implantacaoProducao'])):[];
}
reply(200,['sucesso'=>true,'dados'=>$data,'meta'=>['ambiente'=>'homologacao'],'erro'=>null]);
