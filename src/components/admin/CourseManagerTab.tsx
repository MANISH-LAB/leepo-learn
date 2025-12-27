import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileVideo,
  Plus,
  Trash2,
  MoreHorizontal,
  Loader2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";

import { Node, NodeType } from "../../utils/sharedData";
import * as db from "../../utils/supabase/database";

interface CourseManagerTabProps {
  courseData: Node[];
  setCourseData: (data: Node[]) => void;
}

export function CourseManagerTab({ courseData, setCourseData }: CourseManagerTabProps) {
  const tree = courseData;
  const setTree = setCourseData;
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string; title: string } | null>(null);

  // Helper to recursively find and update a node
  const updateNode = (nodes: Node[], id: string, updates: Partial<Node>): Node[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, id, updates) };
      }
      return node;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    setIsSaving(true);

    try {
      // Update node details
      const nodeUpdated = await db.updateNode(selectedNode.id, {
        title: selectedNode.title,
        type: selectedNode.type,
        iconUrl: selectedNode.iconUrl,
        isActive: selectedNode.isActive !== false, // Default to true
      });

      if (!nodeUpdated) {
        throw new Error("Failed to update node");
      }

      // If TOPIC, update content assets
      if (selectedNode.type === "TOPIC") {
        const assetsUpdated = await db.upsertContentAssets(selectedNode.id, {
          videoUrl: selectedNode.videoUrl,
          videoUrlHindi: selectedNode.videoUrlHindi,
          audioUrl: selectedNode.audioUrl,
          audioUrlHindi: selectedNode.audioUrlHindi,
          pdfUrl: selectedNode.pdfUrl,
          duration: selectedNode.duration,
          isPremium: selectedNode.isPremium,
          interactiveContent: selectedNode.interactiveContent,
        });

        if (!assetsUpdated) {
          throw new Error("Failed to update content assets");
        }
      }

      // If CHAPTER, update assessment
      if (selectedNode.type === "CHAPTER" && selectedNode.assessment) {
        const assessmentUpdated = await db.upsertAssessment(
          selectedNode.id,
          selectedNode.assessment.questions
        );

        if (!assessmentUpdated) {
          throw new Error("Failed to update assessment");
        }
      }

      // Update local state
      setTree(updateNode(tree, selectedNode.id, selectedNode));

      toast.success(`Saved changes for "${selectedNode.title}"`);
    } catch (error) {
      console.error("Error saving node:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChild = async (parentId: string, childType: NodeType) => {
    console.log("handleAddChild called:", { parentId, childType });

    try {
      const title = `New ${childType.charAt(0) + childType.slice(1).toLowerCase()}`;

      console.log("Creating node in database...", { parentId, childType, title });

      // Create in database
      const newNodeId = await db.createNode({
        parentId,
        type: childType,
        title,
        orderIndex: 0,
      });

      console.log("Node created with ID:", newNodeId);

      if (!newNodeId) {
        throw new Error("Failed to create node");
      }

      const newNode: Node = {
        id: newNodeId,
        title,
        type: childType,
        children: [],
        isPremium: false,
        isActive: true,
      };

      const addRecursive = (nodes: Node[]): Node[] => {
        return nodes.map((node) => {
          if (node.id === parentId) {
            console.log("Found parent node, adding child:", parentId);
            return {
              ...node,
              children: [...(node.children || []), newNode],
            };
          }
          if (node.children) {
            return {
              ...node,
              children: addRecursive(node.children),
            };
          }
          return node;
        });
      };

      const updatedTree = addRecursive(tree);
      console.log("Updated tree:", updatedTree);
      setTree(updatedTree);

      // Automatically select the newly created node
      console.log("Selecting new node:", newNode);
      setSelectedNode(newNode);

      toast.success(`Created new ${childType.toLowerCase()}`);
    } catch (error) {
      console.error("Error adding child node:", error);
      toast.error(`Failed to create node: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const confirmDelete = async () => {
    if (!nodeToDelete) return;

    try {
      // Delete from database
      const deleted = await db.deleteNode(nodeToDelete.id);

      if (!deleted) {
        throw new Error("Failed to delete node");
      }

      const deleteRecursive = (nodes: Node[]): Node[] => {
        return nodes.filter(node => node.id !== nodeToDelete.id).map(node => ({
          ...node,
          children: node.children ? deleteRecursive(node.children) : undefined
        }));
      };

      setTree(deleteRecursive(tree));
      if (selectedNode?.id === nodeToDelete.id) {
        setSelectedNode(null);
      }

      toast.success(`"${nodeToDelete.title}" deleted successfully`);
      setNodeToDelete(null);
    } catch (error) {
      console.error("Error deleting node:", error);
      toast.error("Failed to delete node");
      setNodeToDelete(null);
    }
  };

  const handleReorder = async (draggedId: string, targetId: string, position: 'before' | 'after') => {
    console.log('Reorder:', { draggedId, targetId, position });

    try {
      // Find the parent of both nodes to ensure they're siblings
      const findNodeAndParent = (nodes: Node[], id: string, parent: Node | null = null): { node: Node; parent: Node | null } | null => {
        for (const node of nodes) {
          if (node.id === id) {
            return { node, parent };
          }
          if (node.children) {
            const result = findNodeAndParent(node.children, id, node);
            if (result) return result;
          }
        }
        return null;
      };

      const draggedInfo = findNodeAndParent(tree, draggedId);
      const targetInfo = findNodeAndParent(tree, targetId);

      if (!draggedInfo || !targetInfo) {
        toast.error("Cannot reorder: Node not found");
        return;
      }

      // Check if they have the same parent (siblings)
      if (draggedInfo.parent?.id !== targetInfo.parent?.id) {
        toast.error("Can only reorder nodes at the same level");
        return;
      }

      // Get the siblings array
      const siblings = draggedInfo.parent ? draggedInfo.parent.children || [] : tree;
      const draggedIndex = siblings.findIndex(n => n.id === draggedId);
      let targetIndex = siblings.findIndex(n => n.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        toast.error("Cannot reorder: Invalid index");
        return;
      }

      // Adjust target index based on position
      if (position === 'after') {
        targetIndex++;
      }

      // Remove dragged node and insert at new position
      const reorderedSiblings = [...siblings];
      const [draggedNode] = reorderedSiblings.splice(draggedIndex, 1);

      // Adjust target index if dragged was before target
      const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      reorderedSiblings.splice(adjustedTargetIndex, 0, draggedNode);

      // Update order_index for all affected siblings
      const updates = reorderedSiblings.map((node, index) => ({
        id: node.id,
        orderIndex: index,
      }));

      // Update in database
      const success = await db.updateNodeOrder(updates);

      if (!success) {
        throw new Error("Failed to update node order in database");
      }

      // Update local tree
      const updateTreeOrder = (nodes: Node[]): Node[] => {
        return nodes.map(node => {
          if (draggedInfo.parent && node.id === draggedInfo.parent.id) {
            return { ...node, children: reorderedSiblings };
          }
          if (node.children) {
            return { ...node, children: updateTreeOrder(node.children) };
          }
          return node;
        });
      };

      if (draggedInfo.parent) {
        setTree(updateTreeOrder(tree));
      } else {
        setTree(reorderedSiblings);
      }

      toast.success("Reordered successfully");
    } catch (error) {
      console.error("Error reordering nodes:", error);
      toast.error("Failed to reorder nodes");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-200px)]">
      {/* Tree View */}
      <Card className="col-span-1 overflow-auto">
        <CardHeader>
          <CardTitle>Course Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <Tree
            nodes={tree}
            onSelect={setSelectedNode}
            onAddChild={handleAddChild}
            onDelete={(node) => setNodeToDelete({ id: node.id, title: node.title })}
            onReorder={handleReorder}
            selectedId={selectedNode?.id}
          />
          <Button className="w-full mt-4" variant="outline" onClick={async () => {
              try {
                const newNodeId = await db.createNode({
                  type: "DEGREE",
                  title: "New Degree Program",
                  orderIndex: tree.length,
                });

                if (!newNodeId) {
                  throw new Error("Failed to create degree");
                }

                const newNode: Node = {
                  id: newNodeId,
                  title: "New Degree Program",
                  type: "DEGREE",
                  children: [],
                };
                setTree([...tree, newNode]);
                toast.success("Created new degree program");
              } catch (error) {
                console.error("Error creating degree:", error);
                toast.error("Failed to create degree");
              }
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Degree
          </Button>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedNode ? `Edit: ${selectedNode.title}` : "Select a node to edit"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedNode ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedNode.title}
                  onChange={(e) =>
                    setSelectedNode({ ...selectedNode, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="icon">Icon/Logo URL (optional)</Label>
                <Input
                  id="icon"
                  value={selectedNode.iconUrl || ""}
                  onChange={(e) =>
                    setSelectedNode({ ...selectedNode, iconUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">Appears on the right side of the card. Falls back to default icon if empty.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={selectedNode.type}
                  onValueChange={(val: NodeType) =>
                    setSelectedNode({ ...selectedNode, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEGREE">Degree</SelectItem>
                    <SelectItem value="YEAR">Year</SelectItem>
                    <SelectItem value="SUBJECT">Subject</SelectItem>
                    <SelectItem value="CHAPTER">Chapter</SelectItem>
                    <SelectItem value="TOPIC">Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/30">
                <Checkbox
                  id="isActive"
                  checked={selectedNode.isActive !== false}
                  onCheckedChange={(checked) =>
                    setSelectedNode({
                      ...selectedNode,
                      isActive: checked === true,
                    })
                  }
                />
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="font-medium cursor-pointer">
                    Visible to Students
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When unchecked, this course will be hidden from students on the frontend
                  </p>
                </div>
              </div>

              {/* DEGREE specific fields */}
              {selectedNode.type === "DEGREE" && (
                <div className="space-y-4 border-t pt-4">
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-sm mb-2">Degree Program Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      This is a top-level degree program. Add years below to organize the curriculum.
                    </p>
                  </div>
                </div>
              )}

              {/* YEAR specific fields */}
              {selectedNode.type === "YEAR" && (
                <div className="space-y-4 border-t pt-4">
                  <div className="p-3 border rounded-lg bg-purple-50">
                    <h3 className="font-semibold text-sm mb-2">Academic Year Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      This represents an academic year. Add subjects to this year to organize the courses.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBJECT specific fields */}
              {selectedNode.type === "SUBJECT" && (
                <div className="space-y-4 border-t pt-4">
                  <div className="p-3 border rounded-lg bg-green-50">
                    <h3 className="font-semibold text-sm mb-2">Subject Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      This is a subject/course. Add chapters below to organize the topics.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Estimated Duration (optional)</Label>
                    <Input
                      id="duration"
                      value={selectedNode.duration || ""}
                      onChange={(e) =>
                        setSelectedNode({ ...selectedNode, duration: e.target.value })
                      }
                      placeholder="e.g., 12 weeks, 40 hours"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === "CHAPTER" && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Chapter Assessment</Label>
                    <Button variant="outline" size="sm" type="button" onClick={() => {
                        const currentQuestions = selectedNode.assessment?.questions || [];
                        const newQuestion = {
                            id: Math.random().toString(36).substr(2, 9),
                            text: "New Question",
                            options: ["Option A", "Option B", "Option C", "Option D"],
                            correctAnswer: 0
                        };
                        setSelectedNode({
                            ...selectedNode,
                            assessment: {
                                ...(selectedNode.assessment || { questions: [] }),
                                questions: [...currentQuestions, newQuestion]
                            }
                        });
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                     {selectedNode.assessment?.questions?.map((q, qIndex) => (
                        <div key={q.id} className="p-3 border rounded-md space-y-3 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">Q{qIndex + 1}</span>
                                <Input 
                                    value={q.text} 
                                    onChange={(e) => {
                                        const newQuestions = [...(selectedNode.assessment?.questions || [])];
                                        newQuestions[qIndex] = { ...newQuestions[qIndex], text: e.target.value };
                                        setSelectedNode({...selectedNode, assessment: { ...selectedNode.assessment!, questions: newQuestions }});
                                    }}
                                    placeholder="Question text"
                                />
                                <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={() => {
                                    const newQuestions = selectedNode.assessment?.questions?.filter((_, i) => i !== qIndex);
                                    setSelectedNode({...selectedNode, assessment: { ...selectedNode.assessment!, questions: newQuestions || [] }});
                                }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pl-6">
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <div 
                                            className={`h-2 w-2 rounded-full shrink-0 cursor-pointer ${q.correctAnswer === optIndex ? 'bg-green-500' : 'bg-gray-300'}`} 
                                            onClick={() => {
                                                const newQuestions = [...(selectedNode.assessment?.questions || [])];
                                                newQuestions[qIndex] = { ...newQuestions[qIndex], correctAnswer: optIndex };
                                                setSelectedNode({...selectedNode, assessment: { ...selectedNode.assessment!, questions: newQuestions }});
                                            }}
                                        />
                                        <Input 
                                            value={opt} 
                                            className="h-8 text-xs"
                                            onChange={(e) => {
                                                const newQuestions = [...(selectedNode.assessment?.questions || [])];
                                                const newOptions = [...newQuestions[qIndex].options];
                                                newOptions[optIndex] = e.target.value;
                                                newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
                                                setSelectedNode({...selectedNode, assessment: { ...selectedNode.assessment!, questions: newQuestions }});
                                            }}
                                        />
                                        <div className="flex items-center h-full">
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={q.correctAnswer === optIndex}
                                                onChange={() => {
                                                    const newQuestions = [...(selectedNode.assessment?.questions || [])];
                                                    newQuestions[qIndex] = { ...newQuestions[qIndex], correctAnswer: optIndex };
                                                    setSelectedNode({...selectedNode, assessment: { ...selectedNode.assessment!, questions: newQuestions }});
                                                }}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     ))}
                     {(!selectedNode.assessment?.questions || selectedNode.assessment.questions.length === 0) && (
                         <div className="text-sm text-muted-foreground text-center py-4">
                             No assessment questions added yet.
                         </div>
                     )}
                  </div>
                </div>
              )}

              {selectedNode.type === "TOPIC" && (
                <>
                  <div className="space-y-4 border-t pt-4">
                    <div className="p-3 border rounded-lg bg-orange-50">
                      <h3 className="font-semibold text-sm mb-2">Topic Content Settings</h3>
                      <p className="text-xs text-muted-foreground">
                        Add videos, audio, PDFs, and interactive content for this topic.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (e.g., 10:30)</Label>
                    <Input
                      id="duration"
                      value={selectedNode.duration || ""}
                      onChange={(e) =>
                        setSelectedNode({ ...selectedNode, duration: e.target.value })
                      }
                      placeholder="10:30"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="video">Video URL (English)</Label>
                    <Input
                      id="video"
                      value={selectedNode.videoUrl || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="videoHindi">Video URL (Hindi)</Label>
                    <Input
                      id="videoHindi"
                      value={selectedNode.videoUrlHindi || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          videoUrlHindi: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="audio">Audio URL (English)</Label>
                    <Input
                      id="audio"
                      value={selectedNode.audioUrl || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          audioUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="audioHindi">Audio URL (Hindi)</Label>
                    <Input
                      id="audioHindi"
                      value={selectedNode.audioUrlHindi || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          audioUrlHindi: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pdf">PDF URL</Label>
                    <Input
                      id="pdf"
                      value={selectedNode.pdfUrl || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          pdfUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="premium"
                      checked={selectedNode.isPremium}
                      onCheckedChange={(checked) =>
                        setSelectedNode({
                          ...selectedNode,
                          isPremium: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="premium">Premium Content (Locked)</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interactive">Interactive Code Snippet (HTML/JS)</Label>
                    <Textarea
                      id="interactive"
                      value={selectedNode.interactiveContent || ""}
                      onChange={(e) =>
                        setSelectedNode({
                          ...selectedNode,
                          interactiveContent: e.target.value,
                        })
                      }
                      placeholder="<!DOCTYPE html>..."
                      className="font-mono text-xs min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste complete HTML code here. It will be rendered in an iframe for interactive learning.
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                 <Button type="button" variant="destructive" size="icon" onClick={() => setNodeToDelete({ id: selectedNode.id, title: selectedNode.title })}>
                    <Trash2 className="h-4 w-4"/>
                 </Button>
                 <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                 </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Select an item from the tree to view details
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!nodeToDelete} onOpenChange={(open) => !open && setNodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{nodeToDelete?.title}"</strong> and all its children from the database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Recursive Tree Component
function Tree({
  nodes,
  onSelect,
  onAddChild,
  onDelete,
  onReorder,
  selectedId,
  level = 0,
}: {
  nodes: Node[];
  onSelect: (node: Node) => void;
  onAddChild: (parentId: string, type: NodeType) => void;
  onDelete: (node: Node) => void;
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
  selectedId?: string;
  level?: number;
}) {
  return (
    <div className="pl-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onReorder={onReorder}
          selectedId={selectedId}
          level={level}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  onSelect,
  onAddChild,
  onDelete,
  selectedId,
  level,
  onReorder,
}: {
  node: Node;
  onSelect: (node: Node) => void;
  onAddChild: (parentId: string, type: NodeType) => void;
  onDelete: (node: Node) => void;
  selectedId?: string;
  level: number;
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}) {
  const [isOpen, setIsOpen] = useState(false); // Start collapsed - expand one level at a time
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState<'before' | 'after' | null>(null);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  const getNextType = (currentType: NodeType): NodeType | null => {
      switch (currentType) {
          case "DEGREE": return "YEAR";
          case "YEAR": return "SUBJECT";
          case "SUBJECT": return "CHAPTER";
          case "CHAPTER": return "TOPIC";
          default: return null;
      }
  };

  const nextType = getNextType(node.type);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === node.id) return; // Don't allow drop on self

    e.dataTransfer.dropEffect = 'move';

    // Determine if we're in the top or bottom half
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDragOver(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('text/plain');

    if (draggedId && draggedId !== node.id && onReorder && dragOver) {
      onReorder(draggedId, node.id, dragOver);
    }

    setDragOver(null);
  };

  return (
    <div className="relative">
      {/* Drop zone indicator - before */}
      {dragOver === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-10 rounded-full" style={{ marginLeft: `${level * 12}px` }} />
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center justify-between py-1 pr-2 rounded-sm hover:bg-accent group relative ${
          isSelected ? "bg-accent text-accent-foreground" : ""
        } ${isDragging ? "opacity-40 bg-blue-50" : ""}`}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <div className="flex items-center overflow-hidden">
            {/* Drag Handle */}
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded mr-1"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <button
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}
            className={`p-1 mr-1 rounded-sm hover:bg-muted ${
                !hasChildren && !nextType ? "invisible" : ""
            }`}
            >
            {isOpen ? (
                <ChevronDown className="h-3 w-3" />
            ) : (
                <ChevronRight className="h-3 w-3" />
            )}
            </button>

            {node.type === "TOPIC" ? (
                <FileVideo className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
            ) : (
                <Folder className="h-4 w-4 mr-2 text-yellow-500 shrink-0" />
            )}

            <span
              className="text-sm truncate cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(node);
              }}
            >
              {node.title}
            </span>
        </div>

        <div className="flex items-center transition-opacity">
            {nextType && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 mr-1"
                    title={`Add ${nextType}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddChild(node.id, nextType);
                        setIsOpen(true);
                    }}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-6 w-6 text-black shadow-sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {nextType && (
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(node.id, nextType);
                            setIsOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" /> Add {nextType}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(node);
                        }}
                        className="text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Drop zone indicator - after */}
      {dragOver === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 z-10 rounded-full" style={{ marginLeft: `${level * 12}px` }} />
      )}

      {isOpen && hasChildren && (
        <Tree
          nodes={node.children!}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onReorder={onReorder}
          selectedId={selectedId}
          level={level + 1}
        />
      )}
    </div>
  );
}
