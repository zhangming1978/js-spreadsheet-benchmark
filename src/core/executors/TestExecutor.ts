/**
 * 测试执行器基类
 */
export abstract class TestExecutor {
  /**
   * 执行测试
   */
  abstract execute(adapter: any, config: any): Promise<void>

  /**
   * 清理测试环境
   */
  abstract cleanup(): Promise<void>
}
