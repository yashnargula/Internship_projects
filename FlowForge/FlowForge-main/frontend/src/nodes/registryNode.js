import { InputNode } from "./inputNode";
import { LLMNode } from "./llmNode";
import { TextNode } from "./textNode";
import { OutputNode } from "./outputNode";
import { DeleteNode } from "./deleteNode";
import { ConditionNode } from "./ConditionNode";
import { CalculatorNode } from "./CalculatorNode";
import { FileProcessorNode } from "./FileProcessorNode";
import { JoinNode } from "./JoinNode";
import { SplitNode } from "./SplitNode";

export const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  textNode: TextNode,
  outputNode: OutputNode,
  deleteNode: DeleteNode,
  conditionNode: ConditionNode,
  calculatorNode: CalculatorNode,
  fileProcessorNode: FileProcessorNode,
  joinNode: JoinNode,
  splitNode: SplitNode,
};